import Image from "next/image";

export function SplashSheen({ src }: { src: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover opacity-85 mix-blend-screen"
      />
    </div>
  );
}
