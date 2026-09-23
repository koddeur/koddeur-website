export function highlightTitle(title: string) {
  return title.split(/(\*[^*]+\*)/g).map((piece, index) => {
    if (piece.startsWith("*") && piece.endsWith("*") && piece.length > 2) return <mark key={index}>{piece.slice(1, -1)}</mark>;
    return piece;
  });
}
