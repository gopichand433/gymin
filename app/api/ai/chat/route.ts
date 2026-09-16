import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getUserFitnessContext } from '@/lib/ai/user-context';
import { generateGyminAIResponse } from '@/lib/ai/ai-service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again to consult GYMIN AI.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, customApiKey } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    // 1. Fetch user's real context from database
    const context = await getUserFitnessContext(session.userId);

    // 2. Generate grounded response
    const aiResponse = await generateGyminAIResponse(
      message,
      context,
      typeof customApiKey === 'string' ? customApiKey : undefined
    );

    // 3. Persist to database (best-effort; non-blocking for response)
    let savedMsgId = 'msg_' + Date.now();
    let savedCreatedAt = new Date();

    try {
      let conversation = await prisma.aIConversation.findFirst({
        where: { userId: session.userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (!conversation) {
        conversation = await prisma.aIConversation.create({
          data: {
            userId: session.userId,
            title: 'GYMIN AI Fitness Consultation',
          },
        });
      }

      // Save user message
      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message.trim(),
        },
      });

      // Save assistant message
      const savedAssistantMsg = await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.text,
          cardType: aiResponse.cardType,
          cardData: aiResponse.cardData ? JSON.stringify(aiResponse.cardData) : null,
        },
      });

      savedMsgId = savedAssistantMsg.id;
      savedCreatedAt = savedAssistantMsg.createdAt;
    } catch (dbErr) {
      console.warn('Failed to persist AI chat message to database:', dbErr);
    }

    return NextResponse.json({
      success: true,
      provider: aiResponse.provider,
      message: {
        id: savedMsgId,
        role: 'assistant',
        content: aiResponse.text,
        cardType: aiResponse.cardType,
        cardData: aiResponse.cardData,
        createdAt: savedCreatedAt,
      },
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI chat message.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeProvider = process.env.GEMINI_API_KEY?.trim()
      ? 'gemini'
      : process.env.OPENAI_API_KEY?.trim()
      ? 'openai'
      : 'analytical';

    const conversation = await prisma.aIConversation.findFirst({
      where: { userId: session.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      activeProvider,
      conversationId: conversation?.id || null,
      messages:
        conversation?.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          cardType: m.cardType,
          cardData: m.cardData ? JSON.parse(m.cardData) : null,
          createdAt: m.createdAt,
        })) || [],
    });
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
