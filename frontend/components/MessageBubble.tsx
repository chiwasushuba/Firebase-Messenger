import React from 'react';

interface MessageBubbleProps {
  msgId: string;
  senderUsername: string;
  textMessage: string;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msgId,
  senderUsername,
  textMessage,
  isOwnMessage,
}) => {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-xs break-words ${
          isOwnMessage
            ? 'bg-blue-500 text-white self-end'
            : 'bg-gray-300 text-black self-start'
        }`}
      >
        <div className="text-sm font-semibold mb-1">
          {!isOwnMessage && senderUsername}
        </div>
        <div>{textMessage}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
