import ChatScreen from "@/src/screens/ChatScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";


export default function ChatModal() {
  const params = useLocalSearchParams();

  return (
    <ChatScreen
      route={{
        params: {
          otherUserId: params.otherUserId as string,
          otherUserName: params.otherUserName as string,
          listingId: params.listingId as string,
        },
      }}
    />
  );
}
