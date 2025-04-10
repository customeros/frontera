export const timeAgo = (date: string) => {
  const now = new Date();
  const lastMessageDate = new Date(date);
  const diffInMs = now.getTime() - lastMessageDate.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 60) {
    return `${diffInMins}min `;
  } else if (diffInHours < 24) {
    return `${diffInHours}hours`;
  } else {
    return `${diffInDays}d ago`;
  }
};
