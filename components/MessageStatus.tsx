import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MessageStatusProps = {
  messageStatus: "sent" | "delivered" | "read" | undefined;
};

export default function MessageStatus({ messageStatus }: MessageStatusProps) {
  return (
    <>
      {messageStatus === "sent" && (
        <MaterialCommunityIcons name="check" size={18} color="#968d8dff" />
      )}

      {messageStatus === "delivered" && (
        <MaterialCommunityIcons name="check-all" size={18} color="#807575ff" />
      )}

      {messageStatus === "read" && (
        <MaterialCommunityIcons name="check-all" size={18} color="#53BDEB" />
      )}
    </>
  );
}
