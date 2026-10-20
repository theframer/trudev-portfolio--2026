import Image from "next/image";
import heroPhoto from "@/assets/images/dev-hero-image.png";
import styles from "./HeroImage.module.css";

export default function HeroImage() {
  return (
    <div className={styles.media} aria-hidden="true">
      <Image
        src={heroPhoto}
        alt=""
        fill
        priority
        sizes="(max-width: 900px) 100vw, min(45vw, 600px)"
        className={styles.image}
      />
    </div>
  );
}
