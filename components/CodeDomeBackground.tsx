import type { CSSProperties } from "react";

export function CodeDomeBackground({ images }: { images: string[] }) {
  if (!images.length) return null;
  const tiles = Array.from({ length: Math.max(12, images.length) }, (_, index) => images[index % images.length]);

  return (
    <div className="code-dome" aria-hidden="true">
      <div className="code-dome__sphere">
        {tiles.map((src, index) => {
          const tilt = [-24, 0, 24][index % 3];
          const style = {
            "--dome-angle": `${(360 / tiles.length) * index}deg`,
            "--dome-tilt": `${tilt}deg`,
          } as CSSProperties;
          return <div className="code-dome__tile" style={style} key={`${src}-${index}`}><img src={src} alt="" loading="lazy" /></div>;
        })}
      </div>
      <div className="code-dome__wash" />
    </div>
  );
}
