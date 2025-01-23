import HomePreview from "./home";
import AboutPreview from "./about";
import ServicesPreview from "./services";

const PreviewScreen = () => {
  return (
    <div
      style={{
        overflow: "auto",
        height: "100%",
        maxWidth: "440px",
        margin: "0 auto",
      }}
    >
      <HomePreview />
      <AboutPreview />
      <ServicesPreview />
    </div>
  );
};

export default PreviewScreen;
