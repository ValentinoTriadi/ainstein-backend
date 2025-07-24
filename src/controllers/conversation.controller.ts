import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { db } from "@/db/drizzle";
import { createAuthRouter } from "@/lib";
import {
	addMessageToHistory,
	createConversation,
	deleteConversation,
	getConversation,
	getConversationHistory,
	getListConversation,
} from "@/repositories/conversation.repository";
import { createQuizFromAI, QuizData } from "@/repositories/quiz.repository";
import {
	createFlashcardsFromAI,
	FlashcardData,
} from "@/repositories/flashcard.repository";
import {
	createConversationRoute,
	deleteConversationRoute,
	getConversationHistoryRoute,
	getConversationRoute,
	getListConversationRoute,
	sendMessageRoute,
	generateQuizRoute,
	generateFlashcardRoute,
} from "@/routes/conversation.route";

export const conversationProtectedRouter = createAuthRouter();

// Start a new conversation
conversationProtectedRouter.openapi(createConversationRoute, async (c) => {
	const body = c.req.valid("json");
	const user = c.var.user;
	const res = await createConversation(db, body, user);
	return c.json(res, (res.code as unknown) ?? 201);
});

// Get list of user's conversations
conversationProtectedRouter.openapi(getListConversationRoute, async (c) => {
	const user = c.var.user;
	const res = await getListConversation(db, user);
	return c.json(res, (res.code as unknown) ?? 200);
});

// Get conversation details
conversationProtectedRouter.openapi(getConversationRoute, async (c) => {
	const params = c.req.valid("param");
	const user = c.var.user;
	const res = await getConversation(db, params.id, user);
	return c.json(res, (res.code as unknown) ?? 200);
});

// Get conversation history
conversationProtectedRouter.openapi(getConversationHistoryRoute, async (c) => {
	const params = c.req.valid("param");
	const user = c.var.user;
	const res = await getConversationHistory(db, params.id, user);
	return c.json(res, (res.code as unknown) ?? 200);
});

// Send message and get AI response
conversationProtectedRouter.openapi(sendMessageRoute, async (c) => {
	const params = c.req.valid("param");
	const body = c.req.valid("json");
	const user = c.var.user;

	try {
		const { message, image } = body;
		const conversationId = params.id;

		// First, verify the conversation exists and belongs to the user
		const conversationResult = await getConversation(db, conversationId, user);
		if (!conversationResult.success || !conversationResult.data) {
			return c.json(
				conversationResult,
				(conversationResult.code as unknown) ?? 400,
			);
		}

		// Get conversation history for context
		const historyResult = await getConversationHistory(
			db,
			conversationId,
			user,
		);
		if (!historyResult.success || !historyResult.data) {
			return c.json(historyResult, (historyResult.code as unknown) ?? 400);
		}

		// Add user message to history
		const userMessageResult = await addMessageToHistory(
			db,
			conversationId,
			"user",
			message,
			user,
		);

		if (!userMessageResult.success) {
			return c.json(
				userMessageResult,
				(userMessageResult.code as unknown) ?? 400,
			);
		}

		// Prepare conversation context for AI
		const studyKit = conversationResult.data.studyKit;
		const conversationHistory = historyResult.data;

		// Build context from conversation history
		const messageHistory = conversationHistory.map((msg) => ({
			role: (msg.speaker === "user" ? "user" : "assistant") as
				| "user"
				| "assistant",
			content: msg.messageText,
		}));

		// Create system prompt based on study kit
		const systemPrompt = `Kamu adalah tutor AI yang membantu siswa dengan materi belajar mereka: "${studyKit.title}".
    
Deskripsi Materi Belajar: ${studyKit.description || "Tidak ada deskripsi yang disediakan"}

Kamu harus:
- Memberikan respon yang membantu dan edukatif terkait materi belajar
- Mengajukan pertanyaan klarifikasi untuk lebih memahami kebutuhan siswa
- Menawarkan penjelasan, contoh, dan panduan
- Bersikap mendorong dan suportif
- Tetap fokus pada konten edukasi
- WAJIB merespons dalam Bahasa Indonesia

Buatlah respon yang ringkas namun informatif.`;

		// Prepare content for AI - support both text and images
		const userContent: any[] = [{ type: "text", text: message }];

		// Add image if provided
		if (image) {
			// Convert base64 image to the format expected by Google AI
			userContent.push({
				type: "image",
				image: image, // base64 string
			});
		}

		// Generate AI response using the AI SDK
		const { text: aiResponse } = await generateText({
			model: google("gemini-2.0-flash"),
			system: systemPrompt,
			messages: [
				...messageHistory.slice(-10), // Keep last 10 messages for context
				{ role: "user", content: userContent },
			],
			temperature: 0.7,
			maxTokens: 1000,
		});

		// Add AI response to history
		const aiMessageResult = await addMessageToHistory(
			db,
			conversationId,
			"assistant",
			aiResponse,
			user,
		);

		if (!aiMessageResult.success) {
			return c.json(aiMessageResult, (aiMessageResult.code as unknown) ?? 500);
		}

		// Return the AI response
		return c.json(
			{
				success: true,
				message: "Message sent successfully",
				data: {
					message: aiResponse,
					conversationId,
				},
				code: 200,
			},
			200,
		);
	} catch (error) {
		console.error("Error in AI conversation:", error);
		return c.json(
			{
				success: false,
				message: "Failed to process message",
				error: error instanceof Error ? error.message : "Unknown error",
				code: 500,
			},
			500,
		);
	}
});

// Generate quiz from conversation
conversationProtectedRouter.openapi(generateQuizRoute, async (c) => {
	const params = c.req.valid("param");
	const body = c.req.valid("json");
	const user = c.var.user;

	try {
		const { topic, questionCount } = body;
		const conversationId = params.id;

		// Get conversation and history for context
		const conversationResult = await getConversation(db, conversationId, user);
		if (!conversationResult.success || !conversationResult.data) {
			return c.json(
				conversationResult,
				(conversationResult.code as unknown) ?? 400,
			);
		}

		const historyResult = await getConversationHistory(
			db,
			conversationId,
			user,
		);
		if (!historyResult.success || !historyResult.data) {
			return c.json(historyResult, (historyResult.code as unknown) ?? 400);
		}

		const studyKit = conversationResult.data.studyKit;
		const conversationHistory = historyResult.data;

		// Build context from conversation
		const contextMessages = conversationHistory
			.map((msg) => `${msg.speaker}: ${msg.messageText}`)
			.join("\n");

		const quizTopic = topic || studyKit.title;
		const quizPrompt = `Berdasarkan konteks percakapan berikut dan materi belajar "${studyKit.title}", buatlah ${questionCount} soal kuis dalam bahasa Indonesia.

Konteks percakapan:
${contextMessages}

Deskripsi materi: ${studyKit.description || "Tidak ada deskripsi"}

WAJIB menghasilkan response dalam format JSON yang tepat:
{
  "title": "Judul kuis yang sesuai dengan topik",
  "description": "Deskripsi singkat kuis",
  "questions": [
    {
      "questionText": "Pertanyaan dalam bahasa Indonesia",
      "questionType": "multiple_choice",
      "answers": [
        {"answerText": "Pilihan A", "isCorrect": false},
        {"answerText": "Pilihan B", "isCorrect": true},
        {"answerText": "Pilihan C", "isCorrect": false},
        {"answerText": "Pilihan D", "isCorrect": false}
      ]
    }
  ]
}

Pastikan:
- Semua pertanyaan relevan dengan topik "${quizTopic}"
- Setiap pertanyaan memiliki 4 pilihan jawaban
- Hanya ada satu jawaban yang benar per pertanyaan
- Gunakan bahasa Indonesia yang baik dan benar`;

		// Generate quiz using AI
		const { text: aiResponse } = await generateText({
			model: google("gemini-2.0-flash"),
			messages: [{ role: "user", content: quizPrompt }],
			temperature: 0.3,
			maxTokens: 2000,
		});

		// Parse AI response as JSON
		let quizData: QuizData;
		try {
			quizData = JSON.parse(extractJsonFromResponse(aiResponse));
		} catch (parseError) {
			console.error("Failed to parse AI quiz response:", parseError);
			return c.json(
				{
					success: false,
					message: "Failed to generate valid quiz format",
					code: 500,
				},
				500,
			);
		}

		// Create quiz in database
		const createResult = await createQuizFromAI(
			db,
			conversationResult.data.studyKitId,
			quizData,
			user,
		);

		return c.json(createResult, (createResult.code as unknown) ?? 201);
	} catch (error) {
		console.error("Error generating quiz:", error);
		return c.json(
			{
				success: false,
				message: "Failed to generate quiz",
				error: error instanceof Error ? error.message : "Unknown error",
				code: 500,
			},
			500,
		);
	}
});

// Generate flashcards from conversation
conversationProtectedRouter.openapi(generateFlashcardRoute, async (c) => {
	const params = c.req.valid("param");
	const body = c.req.valid("json");
	const user = c.var.user;

	try {
		const { topic, cardCount } = body;
		const conversationId = params.id;

		// Get conversation and history for context
		const conversationResult = await getConversation(db, conversationId, user);
		if (!conversationResult.success || !conversationResult.data) {
			return c.json(
				conversationResult,
				(conversationResult.code as unknown) ?? 400,
			);
		}

		const historyResult = await getConversationHistory(
			db,
			conversationId,
			user,
		);
		if (!historyResult.success || !historyResult.data) {
			return c.json(historyResult, (historyResult.code as unknown) ?? 400);
		}

		const studyKit = conversationResult.data.studyKit;
		const conversationHistory = historyResult.data;

		// Build context from conversation
		const contextMessages = conversationHistory
			.map((msg) => `${msg.speaker}: ${msg.messageText}`)
			.join("\n");

		const flashcardTopic = topic || studyKit.title;
		const flashcardPrompt = `Berdasarkan konteks percakapan berikut dan materi belajar "${studyKit.title}", buatlah ${cardCount} kartu flashcard dalam bahasa Indonesia.

Konteks percakapan:
${contextMessages}

Deskripsi materi: ${studyKit.description || "Tidak ada deskripsi"}

WAJIB menghasilkan response dalam format JSON yang tepat:
[
  {
    "frontText": "Pertanyaan atau konsep di depan kartu",
    "backText": "Jawaban atau penjelasan di belakang kartu"
  }
]

Pastikan:
- Semua flashcard relevan dengan topik "${flashcardTopic}"
- Gunakan bahasa Indonesia yang baik dan benar
- Buat pertanyaan yang membantu belajar dan mengingat konsep penting
- Jawaban harus jelas dan informatif`;

		// Generate flashcards using AI
		const { text: aiResponse } = await generateText({
			model: google("gemini-2.0-flash"),
			messages: [{ role: "user", content: flashcardPrompt }],
			temperature: 0.3,
			maxTokens: 2000,
		});

		// Parse AI response as JSON
		let flashcardData: FlashcardData[];
		try {
			flashcardData = JSON.parse(extractJsonFromResponse(aiResponse));
		} catch (parseError) {
			console.error("Failed to parse AI flashcard response:", parseError);
			return c.json(
				{
					success: false,
					message: "Failed to generate valid flashcard format",
					code: 500,
				},
				500,
			);
		}

		// Create flashcards in database
		const createResult = await createFlashcardsFromAI(
			db,
			conversationResult.data.studyKitId,
			flashcardData,
			user,
		);

		return c.json(createResult, (createResult.code as unknown) ?? 201);
	} catch (error) {
		console.error("Error generating flashcards:", error);
		return c.json(
			{
				success: false,
				message: "Failed to generate flashcards",
				error: error instanceof Error ? error.message : "Unknown error",
				code: 500,
			},
			500,
		);
	}
});

// Delete conversation
conversationProtectedRouter.openapi(deleteConversationRoute, async (c) => {
	const params = c.req.valid("param");
	const user = c.var.user;
	const res = await deleteConversation(db, params.id, user);
	return c.json(res, (res.code as unknown) ?? 200);
});

// Utility to extract JSON from AI response
function extractJsonFromResponse(text: string): string {
	// Remove markdown code fences
	const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
	if (codeBlockMatch) return codeBlockMatch[1];

	// Try to find the first JSON array/object in the text
	const firstBracket = text.indexOf("[");
	const firstBrace = text.indexOf("{");
	if (firstBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) {
		const lastBracket = text.lastIndexOf("]");
		return text.substring(firstBracket, lastBracket + 1);
	}
	if (firstBrace !== -1) {
		const lastBrace = text.lastIndexOf("}");
		return text.substring(firstBrace, lastBrace + 1);
	}
	// Fallback: return as is
	return text;
}
