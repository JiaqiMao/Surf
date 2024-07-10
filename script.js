document.addEventListener('DOMContentLoaded', function() {
    const videoUpload = document.getElementById('videoUpload');
    const subtitleUpload = document.getElementById('subtitleUpload');
    const videoPlayer = document.getElementById('videoPlayer');
    const subtitlesToggleCheckbox = document.getElementById('subtitlesToggleCheckbox');
    const subtitleSettings = document.getElementById('subtitleSettings');
    const subtitleColor = document.getElementById('subtitleColor');
    const subtitleFontSize = document.getElementById('subtitleFontSize');
    const subtitleAnimation = document.getElementById('subtitleAnimation');

    const subtitleDiv = document.createElement('div');
    subtitleDiv.id = 'subtitles';
    document.body.appendChild(subtitleDiv);

    let subtitles = [];
    let currentSubtitle = null;

    document.getElementById('uploadButton').addEventListener('click', function() {
        videoUpload.click();
    });

    videoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videoPlayer.src = url;
        }
    });

    document.getElementById('uploadSubtitleButton').addEventListener('click', function() {
        subtitleUpload.click();
    });

    subtitleUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const vttText = e.target.result;
                subtitles = parseVTT(vttText);
                videoPlayer.ontimeupdate = updateSubtitle;
            };
            reader.readAsText(file);
        }
    });

    subtitlesToggleCheckbox.addEventListener('change', function() {
        subtitleDiv.style.display = this.checked ? 'block' : 'none';
        subtitleSettings.style.display = this.checked ? 'block' : 'none';
    });

    subtitleColor.addEventListener('input', applyStyles);
    subtitleFontSize.addEventListener('input', applyStyles);
    subtitleAnimation.addEventListener('change', applyStyles);

    function parseVTT(vttText) {
        const lines = vttText.split('\n');
        const subtitles = [];
        let i = 0;

        while (i < lines.length) {
            const timePattern = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
            if (timePattern.test(lines[i])) {
                const [, start, end] = timePattern.exec(lines[i]);
                const text = lines[++i];
                subtitles.push({
                    start: timeToSeconds(start),
                    end: timeToSeconds(end),
                    text: text
                });
            }
            i++;
        }
        return subtitles;
    }

    function timeToSeconds(time) {
        const [hours, minutes, seconds] = time.split(':');
        return (+hours) * 60 * 60 + (+minutes) * 60 + (+seconds);
    }

    function updateSubtitle() {
        const currentTime = videoPlayer.currentTime;
        const newSubtitle = subtitles.find(subtitle => currentTime >= subtitle.start && currentTime <= subtitle.end);

        if (newSubtitle !== currentSubtitle) {
            currentSubtitle = newSubtitle;
            if (currentSubtitle && subtitlesToggleCheckbox.checked) {
                subtitleDiv.textContent = currentSubtitle.text;
                applyInAnimation();
            } else {
                subtitleDiv.textContent = '';
            }
        }
    }

    function applyStyles() {
        subtitleDiv.style.color = subtitleColor.value;
        subtitleDiv.style.fontSize = `${subtitleFontSize.value}px`;
    }

    function applyInAnimation() {
        const animation = subtitleAnimation.value;
        if (animation) {
            subtitleDiv.classList.add(animation);
            subtitleDiv.addEventListener('animationend', () => {
                subtitleDiv.classList.remove(animation);
            }, { once: true });
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        #subtitles {
            position: absolute;
            bottom: 25%;
            width: 100%;
            text-align: center;
            color: white;
            font-size: 16px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.75);
        }
        @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slide {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .fade { animation: fade 1s ease-in-out; }
        .slide { animation: slide 1s ease-in-out; }
    `;
    document.head.appendChild(style);
});
