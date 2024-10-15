const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");
const selectTag = document.querySelectorAll("select");
const translateBtn = document.querySelector("button");
const icons = document.querySelectorAll(".row i");

// Populating the language select options
selectTag.forEach((tag, id) => {
  for (const country_code in countries) {
    let selected = "";

    if (id == 0 && country_code == "en-GB") {
      selected = "selected";
    } else if (id == 1 && country_code == "hi-IN") {
      selected = "selected";
    }

    let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

// Exchanging text areas and select values
exchangeIcon.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;

  fromText.value = toText.value;
  selectTag[0].value = selectTag[1].value;
  toText.value = tempText;
  selectTag[1].value = tempLang;
});

// Translation API call
translateBtn.addEventListener("click", () => {
  let text = fromText.value,
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;

  if (!text) return;

  toText.setAttribute("placeholder", "Translating...");

  let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      toText.value = data.responseData.translatedText;
    });
});

// Speech synthesis functionality
icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (target.classList.contains("fa-copy")) {
      if (target.id === "from") {
        navigator.clipboard.writeText(fromText.value);
      } else {
        navigator.clipboard.writeText(toText.value);
      }
    } else {
      let utterance;
      let text = target.id === "from" ? fromText.value : toText.value;

      if (!text.trim()) return;

      utterance = new SpeechSynthesisUtterance(text);

      // Using only the base language code (e.g., 'en' instead of 'en-GB')
      if (target.id === "from") {
        utterance.lang = selectTag[0].value.split("-")[0]; // from language
      } else {
        utterance.lang = selectTag[1].value.split("-")[0]; // to language
      }

      // Ensuring voices are available before calling speak()
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          let voices = speechSynthesis.getVoices();
          utterance.voice = voices.find((voice) =>
            voice.lang.startsWith(utterance.lang)
          );
          speechSynthesis.speak(utterance);
        };
      } else {
        utterance.voice = voices.find((voice) =>
          voice.lang.startsWith(utterance.lang)
        );
        speechSynthesis.speak(utterance);
      }
    }
  });
});
