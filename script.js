document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const videoUpload = document.getElementById('videoUpload');
    const subtitleUpload = document.getElementById('subtitleUpload');
    const videoPlayer = document.getElementById('videoPlayer');
    const subtitlesToggleCheckbox = document.getElementById('subtitlesToggleCheckbox');
    const subtitleSettings = document.getElementById('subtitleSettings');
    const subtitleColor = document.getElementById('subtitleColor');
    const subtitleFontSize = document.getElementById('subtitleFontSize');
    const subtitleAnimation = document.getElementById('subtitleAnimation');

    // 处理视频上传
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

    // 处理字幕上传
    document.getElementById('uploadSubtitleButton').addEventListener('click', function() {
        subtitleUpload.click();
    });

    subtitleUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const vttText = e.target.result;
                parseVTT(vttText);
            };
            reader.readAsText(file);
        }
    });

    // 解析 VTT 文件
    function parseVTT(vttText) {
        // 移除之前的 track
        const existingTrack = videoPlayer.querySelector('track');
        if (existingTrack) {
            videoPlayer.removeChild(existingTrack);
        }

        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = '字幕';
        track.srclang = 'zh';
        track.src = URL.createObjectURL(new Blob([vttText], { type: 'text/vtt' }));
        videoPlayer.appendChild(track);
    }

    // 切换字幕显示
    subtitlesToggleCheckbox.addEventListener('change', function() {
        const track = videoPlayer.querySelector('track');
        if (track) {
            track.mode = this.checked ? 'showing' : 'disabled';
            subtitleSettings.style.display = this.checked ? 'block' : 'none';
        }
    });

    // 应用字幕设置
    subtitleColor.addEventListener('input', applySubtitleSettings);
    subtitleFontSize.addEventListener('input', applySubtitleSettings);
    subtitleAnimation.addEventListener('change', applySubtitleSettings);

    function applySubtitleSettings() {
        const track = videoPlayer.querySelector('track');
        if (track && track.track) {
            // 暂时不支持对 track 的样式进行修改，这里仅为示例
            // 可以通过创建自定义字幕显示层来实现样式设置
            const cues = track.track.cues;
            for (let i = 0; i < cues.length; i++) {
                const cue = cues[i];
                cue.style = `color: ${subtitleColor.value}; font-size: ${subtitleFontSize.value}px;`;
                cue.className = subtitleAnimation.value;
            }
        }
    }

    // 处理字幕动画样式
    const style = document.createElement('style');
    style.textContent = `
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
