import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validation/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    chatID: string;
  };
}

async function getChatMessages(chatID: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatID}:messages`,
      0,
      -1
    );
    const dbMessage = results.map((message) => JSON.parse(message) as Message);
    const reversedDbMessage = dbMessage.reverse();
    const messages = messageArrayValidator.parse(reversedDbMessage);
    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: pageProps) => {
  const { chatID } = params;
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  const { user } = session;

  const [userID1, userID2] = chatID.split("--");

  if (user.id !== userID1 && user.id !== userID2) {
    notFound();
  }
  const chatPartnerId = user.id === userID1 ? userID2 : userID1;

  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;
  const initialMessages = await getChatMessages(chatID);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        sessionImg={session.user.image}
        chatPartner={chatPartner}
        chatId={chatID}
      />
      <ChatInput chatPartner={chatPartner} chatId={chatID} />
    </div>
  );
};

export default page;
