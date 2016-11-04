
var Huisstijl = Huisstijl || (function () {
    var self = {};

    window.siteRoot = window.location.protocol + '//' + window.location.host + '/';

    self.htmlDecode = function (value) {
        return $('<div/>').html(value).text();
    }

    self.htmlEncode = function(value) {
        return $('<div/>').text(value).html();
    }

    self.parseUnobtrusiveFormValidation = function (form) {
        form.removeData("validator");
        form.removeData("unobtrusiveValidation");
        $.validator.unobtrusive.parse(form);
    };

    self.isFormValid = function (form) {
        return form.valid() && form.validate().pendingRequest == 0;
    };

    self.blockUI = function () {
        $.blockUI({
            message: '<h4><img src="' + window.siteRoot + '/Content/images/loading.gif" /> We verwerken de gegevens...</h4>',
            css: { border: '0px' },
            baseZ: 1051 //bootstrap modal is 1050
        });
    }

    self.unBlockUI = function () {
        $.unblockUI();
    }

    self.initTooltips = function () {
        $('[data-toggle="tooltip"]').tooltip({ html: true });
    }

    self.modalAlert = function (options) {
        var defaultOptions = {
            message: "This is a message",
            callback: function () { }
        }
        $.extend(defaultOptions, options);
        bootbox.alert(options);
    }

    self.stringFormat = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match;
        });
    }

    self.parseJsonDateTime = function (jsonDate) {
        var date = new Date(parseInt(jsonDate.substr(6)));
        return date.getDate().pad() + '/' + (date.getMonth() + 1).pad() + '/' + date.getFullYear() + " " + date.getHours().pad() + ":" + date.getMinutes().pad() + ":" + date.getSeconds().pad();
    }

    self.inputmask = function (options) {
        $(options.selector).inputmask(options.format, options.options);
    }

    

    self.showSucessMessage = function (selector, message, focusMessage) {
        self.showMessage({
            messageClass: "success",
            messageIcon: "fa-check-circle",
            messageTitle: "Voltooid",
            message: message,
            placeholder: selector
        });

        if (focusMessage == null || focusMessage)
        { self.scrollToMessage(selector); }
    }

    self.showWarningMessage = function (selector, message, focusMessage) {
        self.showMessage({
            messageClass: "warning",
            messageIcon: "fa-exclamation-circle",
            messageTitle: "Opgelet",
            message: message,
            placeholder: selector
        });

        if (focusMessage == null || focusMessage)
        { self.scrollToMessage(selector); }
    }

    self.showErrorMessage = function (selector, message, focusMessage) {
        self.showMessage({
            messageClass: "danger",
            messageIcon: "fa-exclamation-circle",
            messageTitle: "Fout",
            message: message,
            placeholder: selector
        });

        if (focusMessage == null || focusMessage)
        { self.scrollToMessage(selector); }
    }

    self.scrollToMessage = function (selector) {
        // first check if message is located in a modal
        // if not scroll body
        if ($(selector).closest('.modal').length) {
            var containerModal = $(selector).closest('.modal');

            $(selector).closest('.modal').animate({
                scrollTop: $(selector).offset().top - containerModal.offset().top + containerModal.scrollTop()
            }, 0);
        } else {
            containerModal = $('html, body');
            $('html, body').animate({
                scrollTop: $(selector).offset().top - containerModal.offset().top - $('.nav').height() + containerModal.scrollTop()
            }, 0);
        }
    }

    self.showMessage = function (options) {
        var messageTemplate =
        '<div class="alert alert-{0}" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span></button>' +
            '<div class="media eandis-alert">' +
                '<div class="pull-left">' +
                    '<span class="fa {1} fa-3x"></span>' +
                '</div>' +
                '<div class="media-body">' +
                    '<h4 class="media-heading"><strong>{2}</strong></h4>' +
                    '{3}' +
                '</div>' +
            '</div>' +
        '</div>';
        messageTemplate = Huisstijl.stringFormat(messageTemplate, options.messageClass, options.messageIcon, options.messageTitle, options.message);
        $(options.placeholder).html(messageTemplate);
    }

    self.asyncModal = function (options) {
        $('#pqModal').modal({
            show: false
        });

        $('#pqModal .modal-title').html(options.title);
        $('#pqModal').modal("show");
        $("#pqModalLoading").show();
        $("#pqModalContent").hide();
        $.ajax({
            url: options.url,
            type: 'GET',
            data: options.data,
            success: function (response) {
                $("#pqModalContent").html(response);
                $("#pqModalLoading").hide();
                $("#pqModalContent").show();
                if ($.isFunction(options.onCallback)) {
                    options.onCallback();
                }
                // if autofocus attribute is not recognised => do focus with jquery after screen load (timeout)
                setTimeout(function () { $('[autofocus]:not(:focus)').eq(0).focus(); }, 1000);
            }
        });
    }

    self.closeAsyncModal = function () {
        $('#pqModal').modal("hide");
    }

    self.loadContent = function (options) {
        var defaultOptions = {
            preLoad: function () { },
            callback: function () { }
        }

        if (options) {
            $.extend(defaultOptions, options);
        }

        if ($.isFunction(defaultOptions.preLoad)) {
            defaultOptions.preLoad();
        }

        var pane = $(options.selector);
        pane.html('<div class="row text-center"><img src="' + window.siteRoot + '/Content/images/loading.gif" alt="Laden" /> We verwerken de gegevens...</div>');
        // ajax load van data-url
        pane.load(defaultOptions.url, defaultOptions.callback());
    }


    self.stringArrayToHtmlList = function (stringArray) {
        var list = $("<ul></ul>");
        $.each(stringArray, function (i) {
            var li = $('<li/>')
                .html(this)
                .appendTo(list);
        });
        return list;
    }

    self.handleAjaxResultModelResponse = function (placeholderSelector, response) {
        var messageClass = "success";
        var messageIcon = "fa-check-circle";
        var messageTitle = "Succes";
        var message = "Opdracht succesvol uitgevoerd.";
        if (response.HasErrors || response.HasWarnings) {
            var messageArray = $.merge(response.Errors, response.Warnings);
            var messages = "";
            if (messageArray.length == 1) {
                messages = messageArray[0];
            } else {
                messages = Huisstijl.stringArrayToHtmlList()[0].outerHTML;
            }
            if (response.HasErrors) {
                messageClass = "danger";
                messageIcon = "fa-exclamation-circle";
                messageTitle = "Fout";
                message = messages;
            } else {
                if (response.HasWarnings) {
                    messageClass = "warning";
                    messageIcon = "fa-exclamation-circle";
                    messageTitle = "Opgelet";
                    message = messages;
                }
            }
        }
        var messageTemplate =
        '<div class="alert alert-{0}" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span></button>' +
            '<div class="media eandis-alert">' +
                '<div class="pull-left">' +
                    '<span class="fa {1} fa-3x"></span>' +
                '</div>' +
                '<div class="media-body">' +
                    '<h4 class="media-heading"><strong>{2}</strong></h4>' +
                    '{3}' +
                '</div>' +
            '</div>' +
        '</div>';
        messageTemplate = Huisstijl.stringFormat(messageTemplate, messageClass, messageIcon, messageTitle, message);
        $(placeholderSelector).html(messageTemplate);
        //$('html, body').animate({
        //    scrollTop: $(placeholderSelector).offset().top - 55
        //});
    }

    self.clearDropdownList = function (selector, options) {
        var defaultOptions = {
            emptyOptions: "Maak een keuze"
        }

        if (options) {
            $.extend(defaultOptions, options);
        }

        var optionTemplate = '<option value="">' + defaultOptions.emptyOptions + '</option>';

        $(selector).html(optionTemplate);
    }

    self.autoCompleteDropdown = function (selector, options) {
        var defaultOptions = {
            create: false,
            allowEmptyOption: true,
            sortField: 'text'
        }

        if (options) {
            $.extend(defaultOptions, options);
        }

        $(selector).selectize(options);
    }

    self.reDrawDataTable = function (selector, resetPaging) {
        $(selector).DataTable().draw(resetPaging);
    }

    self.ajaxDataTable = function (selector, options) {
        var defaultOptions = {
            "autoWidth": false,
            "dom": '<"top"<"col-xs-12"<"pull-left"<"#addContainer">>><"col-xs-12 col-sm-6 col-lg-4"l><"col-xs-12 col-sm-6 col-lg-3"<"visible-sm visible-md pull-right"i><"hidden-sm hidden-md"i>><"pull-right"p><"clearfix">>t<"bottom"<"col-xs-12 col-sm-6 col-lg-4"l><"col-xs-12 col-sm-6 col-lg-3"<"visible-sm visible-md pull-right"i><"hidden-sm hidden-md"i>><"pull-right"p><"clearfix">>',
            "language": {
                "processing": "Bezig...",
                "lengthMenu": "_MENU_ resultaten weergeven",
                "zeroRecords": "Geen resultaten gevonden",
                "info": "_START_ tot _END_ van _TOTAL_ resultaten",
                "infoEmpty": "Geen resultaten om weer te geven",
                "infoFiltered": " (gefilterd uit _MAX_ resultaten)",
                "infoPostFix": "",
                "search": "Zoeken:",
                "emptyTable": "Geen resultaten aanwezig in de tabel",
                "thousands": ".",
                "loadingRecords": "Een moment geduld aub - bezig met laden...",
                "paginate": {
                    "first": "<i class='fa fa-fast-backward'></i>",
                    "last": "<i class='fa fa-fast-forward'></i>",
                    "next": "<i class='fa fa-forward'></i>",
                    "previous": "<i class='fa fa-backward'></i>"
                }
            },
            "pagingType": "full_numbers",
            "processing": true,
            "serverSide": true,
            "stateSave": false,
            "pageLength": 25,
            "drawCallback": function () {
                //init tooltips voor knoppen toegevoegd via ajax result
                Huisstijl.initTooltips();
                //zorg er voor dat aantal resultaten dropdown weer op de juiste waarde staat
                $('select[name=' + selector.replace('#', '') + '_length]').val(this.dataTableSettings[0]._iDisplayLength);
                if ($.isFunction(options.onDrawCallback)) {
                    options.onDrawCallback();
                }
            }
        }
        $.extend(defaultOptions, options);
        var returnObject = $(selector)
            .on('processing.dt', function (e, settings, processing) {
                if (processing) {
                    Huisstijl.blockUI();
                } else {
                    Huisstijl.unBlockUI();
                }
            })
            .DataTable(defaultOptions);
        return returnObject;
    }

    self.basicDataTable = function (selector, options) {
        var defaultOptions = {
            "sDom": '<"top"<"col-xs-12 col-sm-6 col-lg-4"l><"col-xs-12 col-sm-6 col-lg-3"<"visible-sm visible-md pull-right"i><"hidden-sm hidden-md"i>><"pull-right"p><"clearfix">>rt<"bottom"<"col-xs-12 col-sm-6 col-lg-4"l><"col-xs-12 col-sm-6 col-lg-3"<"visible-sm visible-md pull-right"i><"hidden-sm hidden-md"i>><"pull-right"p><"clearfix">>',
            "sPaginationType": "full_numbers",
            "oLanguage": {
                "sProcessing": "Bezig...",
                "sLengthMenu": "_MENU_ resultaten weergeven",
                "sZeroRecords": "Geen resultaten gevonden",
                "sInfo": "_START_ tot _END_ van _TOTAL_ resultaten",
                "sInfoEmpty": "Geen resultaten om weer te geven",
                "sInfoFiltered": " (gefilterd uit _MAX_ resultaten)",
                "sInfoPostFix": "",
                "sSearch": "Zoeken:",
                "sEmptyTable": "Geen resultaten aanwezig in de tabel",
                "sInfoThousands": ".",
                "sLoadingRecords": "Een moment geduld aub - bezig met laden...",
                "oPaginate": {
                    "sFirst": "<i class='fa fa-fast-backward'></i>",
                    "sLast": "<i class='fa fa-fast-forward'></i>",
                    "sNext": "<i class='fa fa-forward'></i>",
                    "sPrevious": "<i class='fa fa-backward'></i>"
                },
                "bStateSave": true
            }
        }

        if (options) {
            $.extend(defaultOptions, options);
        }

        return $(selector).DataTable(defaultOptions);
    }

    self.dateTimePicker = function (selector, options) {
        var defaultOptions = {
            locale: "nl",
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            }
        };
        if (options) {
            $.extend(defaultOptions, options);
        }
        $(selector).datetimepicker(defaultOptions);
    }

    self.tokenfield = function (selector, options) {
        return $(selector)
            .on('tokenfield:initialize', function (e) {
                if ($.isFunction(options.onInitialize)) {
                    options.onInitialize(e);
                }
            })
            .on('tokenfield:createtoken', function (e) {
                if ($.isFunction(options.onCreatetoken)) {
                    options.onCreatetoken(e);
                }
            })
            .on('tokenfield:createdtoken', function (e) {
                if ($.isFunction(options.onCreatedtoken)) {
                    options.onCreatedtoken(e);
                }
            })
            .on('tokenfield:edittoken', function (e) {
                if ($.isFunction(options.onEdittoken)) {
                    options.onEdittoken(e);
                }
            })
            .on('tokenfield:editedtoken', function (e) {
                if ($.isFunction(options.onEditedtoken)) {
                    options.onEditedtoken(e);
                }
            })
            .on('tokenfield:removetoken', function (e) {
                if ($.isFunction(options.onRemovetoken)) {
                    options.onRemovetoken(e);
                }
            })
            .on('tokenfield:removedtoken', function (e) {
                if ($.isFunction(options.onRemovedtoken)) {
                    options.onRemovedtoken(e);
                }
            })
            .tokenfield(options);
    }

    self.checkbox = function (selector) {
        $(selector).bootstrapSwitch(
        {
            'labelText': '|||',
            'labelWidth': 10
        }).on('click', function () {
            $(this).bootstrapSwitch('toggleState');
        });
    }

    self.multiselect = function (selector) {
        $(selector).multiselect({
            'includeSelectAllOption': true,
            'nonSelectedText': 'Maak een keuze',
            'selectAllText': 'Selecteer alle',
            'nSelectedText': ' geselecteerd',
            'maxHeight': 200
        });
    }

    self.multiselectSelectAll = function (selector) {
        setTimeout(function () {
            $(selector + " option").prop("selected", true);
            $(selector).multiselect("refresh");
        }, 0);
    }

    self.ToevoegenButtonVoorOverzicht = function (button) {
        $("#addContainer").html(button).text();
    }

    return self;
}());