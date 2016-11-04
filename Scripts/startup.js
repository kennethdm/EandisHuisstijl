$('body').tooltip({ selector: ".normalTooltip, .helpTooltip" });
SyntaxHighlighter.defaults['toolbar'] = false;
SyntaxHighlighter.all();
$(document).ready(function () {
    prettyPrint();
});
$.validator.setDefaults({
    ignore: ""
});
$('.dropdown-submenu > a').submenupicker();

$('[data-toggle="tooltip"]').tooltip({ html: true, container: "body" });