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
    title: "Gloss restored with careful exterior work.",
  },
  {
    label: "Interior reset",
    title: "Cabin surfaces cleaned with attention.",
  },
  {
    label: "Deep clean detail",
    title: "Focused treatment for heavier condition work.",
  },
  {
    label: "Final result",
    title: "A refined finish, ready to drive away.",
  },
];

export function WorkStory() {
  return (
    <section className="work-story" aria-labelledby="work-story-title">
      <div className="work-story__sticky">
        <div className="work-story__copy motion-fade-up">
          <p className="eyebrow">Recent Work</p>
          <h2 id="work-story-title">Detail you can see. Care you can feel.</h2>
          <p>A quiet, careful process designed to reset the vehicle and leave a refined finish.</p>
        </div>

        <div className="work-story__media" aria-label="AUTO VALET work highlights" role="list">
          {storyItems.map((item, index) => (
            <article className={`work-story-card work-story-card--${index + 1}`} key={item.label} role="listitem">
              <div className="image-placeholder work-story-card__placeholder">
                {item.imageUrl ? (
                  <img alt={`AUTO VALET ${item.label}`} className="work-story-card__image" src={item.imageUrl} />
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
