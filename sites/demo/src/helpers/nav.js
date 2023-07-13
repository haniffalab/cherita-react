export default function setPosition(e) {
  const parent = e.target.parentElement;
  if (parent.classList.contains("cherita-navbar-item")) {
    const dropdown = e.target.nextElementSibling;
    const navbar = e.target.closest(".cherita-navbar");
    const container = e.target.closest(".cherita-container");
    console.log(parent);

    const navbarBoundingBox = navbar.getBoundingClientRect();
    const parentBoundingBox = e.target.getBoundingClientRect();
    const containerBoundingBox = container.getBoundingClientRect();

    const top =
      navbarBoundingBox.top + navbarBoundingBox.height - parentBoundingBox.top;
    const left = navbarBoundingBox.left - parentBoundingBox.left;
    const right = navbarBoundingBox.right - parentBoundingBox.right;

    dropdown.style.position = "absolute";
    dropdown.style.top = top + "px";
    dropdown.style.width = navbarBoundingBox.width / 2 + "px";
    dropdown.style.height =
      containerBoundingBox.height - navbarBoundingBox.height - 40 + "px";

    if (dropdown.classList.contains("dropdown-menu-end")) {
      dropdown.style.right = right * -1 + "px";
    } else {
      dropdown.style.left = left + "px";
    }

    //document.documentElement.style.setProperty('--dropdown-height', (containerBoundingBox.height - navbarBoundingBox.height - 40) + "px");
  }
}
