const sourceInput = document.getElementById("sourceUrl");
const searchButton = document.querySelector(".searchSource button");
const templateResult = document.querySelector(".result p.templateAss");

const styleResult = document.querySelector(".result p.style");
const eventResult = document.querySelector(".result p.event");

// fetch("https://www.youtube.com/watch?v=tYcQ6BTvVQw")
//     .then(response => console.log(response))


searchButton.addEventListener("click", _ => {
    let jsonData;
    const url = sourceInput.value;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            jsonData = responseJson;
            console.log(jsonData);

            templateResult.innerText = `[Script Info]
            ; Script generated by Aegisub 3.2.2
            ; http://www.aegisub.org/
            Title: Default Aegisub file
            ScriptType: v4.00+
            WrapStyle: 0
            ScaledBorderAndShadow: yes
            PlayResX: 384
            PlayResY: 288
            YCbCr Matrix: None

            [Aegisub Project Garbage]\n
            `;

            results = convert(jsonData);
            styleResult.innerText = results[0];
            eventResult.innerText = results[1];

        });
});