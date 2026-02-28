export const getDominantColor = async () => {
  const colors = [
    "#1c1c1c",
    "#2c3e50",
    "#3a1c71",
    "#16213e",
    "#0f2027",
    "#232526",
    "#141e30",
    "#42275a",
    "#000428",
  ];

  const random =
    colors[Math.floor(Math.random() * colors.length)];

  return random;
};
