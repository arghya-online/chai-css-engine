export function extractClasses() {
  const elements = document.querySelectorAll("*");

  const classList = [];

  elements.forEach((element) => {
    const classes = element.classList;

    classes.forEach((cls) => {
      if (cls.startsWith("chai-")) {
        classList.push({
          element: element,
          className: cls,
        });
      }
    });
  });
  return classList;
}
