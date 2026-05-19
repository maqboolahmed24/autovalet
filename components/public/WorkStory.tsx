import Link from "next/link";

type StoryItem = {
  label: string;
  title: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  imageUrl?: string;
};

const storyItems: StoryItem[] = [
  {
    label: "Exterior finish",
    title: "Clean paintwork and glass, finished with a sharp exterior stance.",
    imageUrl: "/media/auto-valet/exterior-finish.webp",
  },
  {
    label: "Interior reset",
    title: "Cabin touchpoints, seats and trim reset after a careful clean.",
    imageUrl: "/media/auto-valet/interior-reset.webp",
  },
  {
    label: "Alloys/wheels finish",
    title: "Alloys, tyre walls and exterior edges finished with a sharp clean look.",
    imageUrl: "/media/auto-valet/red-interior.webp",
  },
  {
    label: "Final result",
    title: "Polished details that hold up under close inspection.",
    imageUrl: "/media/auto-valet/final-finish.webp",
  },
];

export function WorkStory() {
  return (
    <section className="work-story" aria-labelledby="work-story-title">
      <div className="work-story__sticky">
        <div className="work-story__copy motion-fade-up">
          <p className="eyebrow">Recent Work</p>
          <h2 id="work-story-title">Detail you can see. Care you can feel.</h2>
          <p>A careful, refined process designed to restore the vehicle with a clean, finished feel.</p>
          <Link className="secondary-button work-story__gallery-link" href="/gallery">
            View Gallery
          </Link>
        </div>

        <div className="work-story__media" aria-label="AUTO VALET work highlights" role="list">
          {storyItems.map((item, index) => (
            <article className={`work-story-card work-story-card--${index + 1}`} key={item.label} role="listitem">
              <div
                className={`image-placeholder work-story-card__placeholder${
                  item.imageUrl ? " work-story-card__placeholder--image" : ""
                }`}
              >
                {item.imageUrl ? (
                  <img
                    alt={`AUTO VALET ${item.label}`}
                    className="work-story-card__image"
                    decoding="async"
                    height="1300"
                    loading="lazy"
                    src={item.imageUrl}
                    width="1100"
                  />
                ) : (
                  <span className="work-story-card__placeholder-note">Image coming soon</span>
                )}
                <span className="image-placeholder__label">{item.label}</span>
              </div>

              <div className="work-story-card__caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
