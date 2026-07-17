require('../cms');

(function() {
    $(document).on('change', '#orm_file', function (ev) {
        handleFiles(this.files);
    });

    showFileSize($('#orm_fileSize').val())
})();

function handleFiles(files) {

    var preview = document.getElementById("preview");

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;

        // $('.file-download').hide();
        $('#file-name').html('Original file: ' + file.name);
        $('#file-type').html(file.type);
        showFileSize(file.size)

        if (!file.type.match(imageType)) {
            $('#preview').find('img').attr('src', '/cms/images/files/shadow.gif');
            $('#preview').find('img').css('width', '600px');
            $('#preview').find('img').css('height', '250px');
            continue;
        }

        $('#preview').empty();
        var img = document.createElement("img");
        img.classList.add("obj");
        img.file = file;
        preview.appendChild(img); // Assuming that "preview" is a the div output where the content will be displayed.

        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
    }
};
window.handleFiles = handleFiles;

function showFileSize(size) {
    $('#file-size').html(getFormattedSize(size));
    $('#file-size-unit').html(getFormattedSizeUnit(size));
};
window.showFileSize = showFileSize;

function getFormattedSize(fileSize) {
    if (fileSize > 1000000000000) {
        return formatMoney(fileSize / 1000000000000, 2);
    } else if (fileSize > 1000000000) {
        return formatMoney(fileSize / 1000000000, 2);
    } else if (fileSize > 1000000) {
        return formatMoney(fileSize / 1000000, 2);
    } else if (fileSize > 1000) {
        return formatMoney(fileSize / 1000, 0);
    } else {
        return fileSize;
    }
};
window.getFormattedSize = getFormattedSize;

function getFormattedSizeUnit(fileSize) {
    if (fileSize > 1000000000000) {
        return 'TB';
    } else if (fileSize > 1000000000) {
        return 'GB';
    } else if (fileSize > 1000000) {
        return 'MB';
    } else if (fileSize > 1000) {
        return 'KB';
    } else {
        return 'B';
    }
};
window.getFormattedSizeUnit = getFormattedSizeUnit;

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
window.formatMoney = formatMoney;
