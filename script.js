(function () {
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYn9Rf0td4asFpktTaapX6x6lQdmfc-L4KR_PE9pi_I4bqFwrF5LFHyqoCRkFt5Yw/exec";

  function readPixels(value) {
    return Number.parseFloat(String(value).replace("px", ""));
  }

  function resizeCanvas() {
    const stage = document.querySelector(".stage");
    const canvas = document.getElementById("weddingCanvas");

    if (!stage || !canvas) {
      return;
    }

    const styles = window.getComputedStyle(document.documentElement);
    const designWidth = readPixels(styles.getPropertyValue("--design-width"));
    const designHeight = readPixels(styles.getPropertyValue("--design-height"));
    const availableWidth = document.documentElement.clientWidth || window.innerWidth;
    const scale = Math.min(1, availableWidth / designWidth);

    stage.style.width = `${designWidth * scale}px`;
    stage.style.height = `${designHeight * scale}px`;
    canvas.style.transform = `scale(${scale})`;
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
  resizeCanvas();

  const form = document.getElementById("weddingForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const btn = document.getElementById("submitBtn");
    const statusMsg = document.getElementById("statusMessage");
    const hiddenDrinks = document.getElementById("hiddenDrinks");

    const checkboxes = form.querySelectorAll('input[name="Напитки_chk"]:checked');
    const drinksValues = Array.from(checkboxes).map((checkbox) => checkbox.value).join(", ");
    hiddenDrinks.value = drinksValues;

    const formData = new FormData(form);
    formData.delete("Напитки_chk");

    btn.innerText = "Отправка...";
    btn.disabled = true;
    statusMsg.innerText = "";

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          btn.innerText = "Успешно отправлено!";
          statusMsg.innerText = "";
          form.reset();
        } else {
          throw new Error("Ошибка на стороне сервера");
        }
      })
      .catch((error) => {
        btn.innerText = "Отправить";
        btn.disabled = false;
        statusMsg.style.color = "#d93b3b";
        statusMsg.innerText = "Произошла ошибка. Попробуйте еще раз.";
        console.error("Error:", error);
      });
  });
})();
