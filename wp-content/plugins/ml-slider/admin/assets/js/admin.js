jQuery(function($) {
    
        /*
         * UI for adding a slide. Managed through the WP media upload UI
         * Event managed here.
         */
        var create_slides = wp.media.frames.file_frame = wp.media({
            multiple: 'add',
            frame: 'post',
            library: {type: 'image'}
        });
        create_slides.on('insert', function() {
            MetaSlider_Helpers.loading(true)
            
            var slide_ids = [];
            create_slides.state().get('selection').map(function(media) {
                slide_ids.push(media.toJSON().id);
            });
    
            var data = {
                action: 'create_image_slide',
                slider_id: window.parent.metaslider_slider_id,
                selection: slide_ids,
                _wpnonce: metaslider.create_slide_nonce
            };
    
            // TODO: Create micro feedback to the user. 
            // TODO: Adding lots of slides locks up the page due to 'resizeSlides' event
            $.ajax({
                url: metaslider.ajaxurl, 
                data: data,
                method: 'POST',
                beforeSend: function() { MetaSlider_Helpers.loading(true); },
                complete: function() {MetaSlider_Helpers.loading(false); },
                error: function(response) {    
                    alert(response.responseJSON.data.message);
                },
                success: function(response) {
    
                    /*
                    * Echo Slide on success
                    * TODO: instead have it return data and use JS to render it
                    */           
                    $(".metaslider .left table").append(response);
                    MetaSlider_Helpers.loading(false)
                    $(".metaslider .left table").trigger('resizeSlides');
                }
            });
        });
    
        /*
         * UI for changing slide image. Managed through the WP media upload UI
         * Initialized dynamically due to multiple slides.
         */
        var update_slide_frame;
    
        /*
         * Opens the UI for the slide selection.
         */
        $('.metaslider').on('click', '.add-slide', function(event){
            event.preventDefault();
            create_slides.open();
    
            // Remove the Media Library tab (media_upload_tabs filter is broken in 3.6)
            // TODO investigate if this is needed
            $(".media-menu a:contains('Media Library')").remove();
        });
    
        /**
         * Handles changing an image when edited by the user.
         */
        $('.metaslider').on('click', '.update-image', function(event) {
            event.preventDefault();
            var $this = $(this);
    
            /*
             * Opens up a media window showing images
             */
            update_slide_frame = wp.media.frames.file_frame = wp.media({
                title: MetaSlider_Helpers.capitalize(metaslider.update_image),
                library: {type: 'image'},
                button: {
                    text: MetaSlider_Helpers.capitalize($this.attr('data-button-text'))
                }
            }).open();
    
            /*
             * Handles changing an image in DB and UI
             */
            update_slide_frame.on('select', function() {
                var selection = update_slide_frame.state().get('selection');
                selection.map(function(attachment) {
                    attachment = attachment.toJSON();
                    new_image_id = attachment.id;
                });
    
                /**
                 * Updates the meta information on the slide
                 */
                var data = {
                    action: 'update_slide_image',
                    _wpnonce: metaslider.update_slide_image_nonce,
                    slide_id: $this.data('slideId'),
                    slider_id: window.parent.metaslider_slider_id,
                    image_id: new_image_id
                };
                
                $.ajax({
                    url: metaslider.ajaxurl, 
                    data: data,
                    method: 'POST',
                    beforeSend: function() { MetaSlider_Helpers.loading(true); },
                    complete: function() {MetaSlider_Helpers.loading(false); },
                    error: function(response) {    
                        alert(response.responseJSON.data.message);
                    },
                    success: function(response) {
    
                        /*
                        * Updates the image on success
                        */
                        $('#slide-' + $this.data('slideId') + ' .thumb')
                            .css('background-image', 'url(' + response.data.img_url + ')');
                        $(".metaslider .left table").trigger('resizeSlides');            
                    }
                });
            });
        });

    
        /**
         * delete a slide using ajax (avoid losing changes)
         */
        $(".metaslider").on('click', '.delete-slide', function(event) {
            event.preventDefault();
            var $this = $(this);
            var data = {
                action: 'delete_slide',
                _wpnonce: metaslider.delete_slide_nonce,
                slide_id: $this.data('slideId'),
                slider_id: window.parent.metaslider_slider_id
            };

            // Set the slider state to deleting
            $this.parents('#slide-' + $this.data('slideId'))
                 .removeClass('ms-restored')
                 .addClass('ms-deleting')
                 .append('<div class="ms-delete-overlay"><i style="height:24px;width:24px"><svg class="ms-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg></i></div>');
            $this.parents('#slide-' + $this.data('slideId'))
                 .find('.ms-delete-status')
                 .remove();
            
            $.ajax({
                url: metaslider.ajaxurl, 
                data: data,
                method: 'POST',
                error: function(response) {

                    // Delete failed. Remove delete state UI
                    alert(response.responseJSON.data.message);
                    $slide = $this.parents('#slide-' + $this.data('slideId'));
                    $slide.removeClass('ms-deleting');
                    $slide.find('.ms-delete-overlay').remove();
                },
                success: function(response) {
                    var count = 10;

                    // Remove deleting state and add a deleted state with restore option
                    setTimeout(function() {
                        $slide = $this.parents('#slide-' + $this.data('slideId'));
                        $slide.addClass('ms-deleted')
                             .removeClass('ms-deleting')
                             .find('.metaslider-ui-controls').append(
                                '<button class="undo-delete-slide" title="' + metaslider.restore_language + '" data-slide-id="' + $this.data('slideId') + '">' + metaslider.restore_language + '</button>'
                        );

                        // Grab the image from the slide
                        var img = $slide.find('.thumb').css('background-image')
                                        .replace(/^url\(["']?/, '')
                                        .replace(/["']?\)$/, '');

                        // If the image is the same as the URL then it's empty (external slide type)
                        img = (window.location.href === img) ? '' : img;
                        
                        // Send a notice to the user
                        var notice = new MS_Notification(metaslider.deleted_language, metaslider.click_to_undo_language, img);

                        // Fire the notice and set callback to undo
                        notice.fire(10000, function() {
                            jQuery('#slide-' + $this.data('slideId'))
                                .addClass('hide-status')
                                .find('.undo-delete-slide').trigger('click');
                        });

                        // If the trash link isn't there, add it in (without counter)
                        if ('none' == $('.restore-slide-link').css('display')) {
                            $('.restore-slide-link').css('display', 'inline');
                        }
                    }, 1000);
                }
            });
        });

        /**
         * delete a slide using ajax (avoid losing changes)
         */
        $(".metaslider").on('click', '.undo-delete-slide, .trash-view-restore', function(event) {
            event.preventDefault();
            var $this = $(this);
            var data = {
                action: 'undelete_slide',
                _wpnonce: metaslider.undelete_slide_nonce,
                slide_id: $this.data('slideId'),
                slider_id: window.parent.metaslider_slider_id
            };

            // Remove undo button
            $('#slide-' + $this.data('slideId')).find('.undo-delete-slide').html('');

            // Set the slider state to deleting
            $this.parents('#slide-' + $this.data('slideId'))
                 .removeClass('ms-deleted')
                 .addClass('ms-deleting')
                 .css('padding-top', '31px')
                 .append('<div class="ms-delete-overlay"><i style="height:24px;width:24px"><svg class="ms-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg></i></div>');
            $this.parents('#slide-' + $this.data('slideId'))
                 .find('.ms-delete-status')
                 .remove();
            $this.parents('#slide-' + $this.data('slideId'))
                 .find('.delete-slide')
                 .focus();

            $.ajax({
                url: metaslider.ajaxurl, 
                data: data,
                method: 'POST',
                error: function(response) {
                    
                    // Undelete failed. Remove delete state UI
                    $slide = $this.parents('#slide-' + $this.data('slideId'));
                    $slide.removeClass('ms-restoring').addClass('ms-deleted');
                    $slide.find('.ms-delete-overlay').remove();

                    // If there was a WP error, this should be populated:
                    if (response.responseJSON) {
                        alert(response.responseJSON.data.message);
                    } else {
                        alert('There was an error with the server and the action could not be completed.');
                    }
                },
                success: function(response) {

                    // Restore to original state
                    $slide = $this.parents('#slide-' + $this.data('slideId'));
                    $slide.addClass('ms-restored')
                    $slide.removeClass('ms-deleting')
                          .find('.undo-delete-slide, .trash-view-restore').remove();
                    $slide.find('.ms-delete-overlay').remove();
                    $('#slide-' + $this.data('slideId') + ' h4').after('<span class="ms-delete-status is-success">' + metaslider.restored_language + '</span>');

                    // We can try to remove the buton actions too (trashed view)
                    $('#slide-' + $this.data('slideId')).find('.row-actions.trash-btns').html('');

                    // Grab the image from the slide
                    var img = $slide.find('.thumb').css('background-image')
                                    .replace(/^url\(["']?/, '')
                                    .replace(/["']?\)$/, '');

                    // If the image is the same as the URL then it's empty (external slide type)
                    img = (window.location.href === img) ? '' : img;

                    // Send a success notification
                    var notice = new MS_Notification(metaslider.restored_language, '', img, 'is-success');
                    
                    // Fire the notice
                    notice.fire(5000);
                }
            });
        });
        
        // Enable the correct options for this slider type
        var switchType = function(slider) {
            $('.metaslider .option:not(.' + slider + ')').attr('disabled', 'disabled').parents('tr').hide();
            $('.metaslider .option.' + slider).removeAttr('disabled').parents('tr').show();
            $('.metaslider input.radio:not(.' + slider + ')').attr('disabled', 'disabled');
            $('.metaslider input.radio.' + slider).removeAttr('disabled');
    
            $('.metaslider .showNextWhenChecked:visible').parent().parent().next('tr').hide();
            $('.metaslider .showNextWhenChecked:visible:checked').parent().parent().next('tr').show();
    
            // make sure that the selected option is available for this slider type
            if ($('.effect option:selected').attr('disabled') === 'disabled') {
                $('.effect option:enabled:first').attr('selected', 'selected');
            }
    
            // make sure that the selected option is available for this slider type
            if ($('.theme option:selected').attr('disabled') === 'disabled') {
                $('.theme option:enabled:first').attr('selected', 'selected');
            }
        };
    
        // enable the correct options on page load
        switchType($(".metaslider .select-slider:checked").attr("rel"));
    
        var toggleNextRow = function(checkbox) {
            if(checkbox.is(':checked')){
                checkbox.parent().parent().next("tr").show();
            } else {
                checkbox.parent().parent().next("tr").hide();
            }
        }
    
        toggleNextRow($(".metaslider .showNextWhenChecked"));
    
        $(".metaslider .showNextWhenChecked").on("change", function() {
            toggleNextRow($(this));
        });
    
        // mark the slide for resizing when the crop position has changed
        $(".metaslider").on('change', '.left tr.slide .crop_position', function() {
            $(this).closest('tr').data('crop_changed', true);
        });
    
        // handle slide libary switching
        $(".metaslider .select-slider").on("click", function() {
            switchType($(this).attr("rel"));
        });
    
        // return a helper with preserved width of cells
        var metaslider_sortable_helper = function(e, ui) {
            ui.children().each(function() {
                $(this).width($(this).width());
            });
            return ui;
        };
    
        // drag and drop slides, update the slide order on drop
        $(".metaslider .left table tbody").sortable({
            helper: metaslider_sortable_helper,
            handle: "td.col-1",
            stop: function() {
                $(".metaslider .left table").trigger("updateSlideOrder");
                $("#ms-save").click();
            }
        });
    
        // bind an event to the slides table to update the menu order of each slide
        $(".metaslider .left table").live("updateSlideOrder", function(event) {
            $("tr", this).each(function() {
                $("input.menu_order", $(this)).val($(this).index());
            });
        });
    
        // bind an event to the slides table to update the menu order of each slide
        $(".metaslider .left table").live("resizeSlides", function(event) {
            var slideshow_width = $("input.width").val();
            var slideshow_height = $("input.height").val();
    
            $("tr.slide input[name='resize_slide_id']", this).each(function() {
                $this = $(this);
    
                var thumb_width = $this.attr("data-width");
                var thumb_height = $this.attr("data-height");
                var slide_row = $(this).closest('tr');
                var crop_changed = slide_row.data('crop_changed');
    
                if (thumb_width != slideshow_width || thumb_height != slideshow_height || crop_changed === true ) {
                    $this.attr("data-width", slideshow_width);
                    $this.attr("data-height", slideshow_height);
    
                    var data = {
                        action: "resize_image_slide",
                        slider_id: window.parent.metaslider_slider_id,
                        slide_id: $this.attr("data-slide_id"),
                        _wpnonce: metaslider.resize_nonce
                    };
    
                    $.ajax({
                        type: "POST",
                        data : data,
                        async: false,
                        cache: false,
                        url: metaslider.ajaxurl,
                        success: function(data) {
                            if (crop_changed === true) {
                                slide_row.data('crop_changed', false);
                            }
    
                            if (console && console.log) {
                                console.log(data);
                            }
                        }
                    });
                }
            });
        });
    
        $(document).ajaxStop(function() {
            $(".metaslider .spinner").hide().css('visibility', '');
            $(".metaslider button[type=submit]").removeAttr("disabled");
        });
    
        $(".useWithCaution").on("change", function(){
            if(!this.checked) {
                return alert(metaslider.useWithCaution);
            }
        });
    
        // helptext tooltips
        $(".tipsy-tooltip").tipsy({className: 'msTipsy', live: true, delayIn: 500, html: true, gravity: 'e'});
        $(".tipsy-tooltip-top").tipsy({live: true, delayIn: 500, html: true, gravity: 's'});
    
        // Select input field contents when clicked
        $(".metaslider .shortcode input, .metaslider .shortcode textarea").on('click', function() {
            this.select();
        });
    
        // return lightbox width
        var getLightboxWidth = function() {
            var width = parseInt($('input.width').val(), 10);
    
            if ($('.carouselMode').is(':checked')) {
                width = '75%';
            }
    
            return width;
        };
    
        // return lightbox height
        var getLightboxHeight = function() {
            var height = parseInt($('input.height').val(), 10);
            var thumb_height = parseInt($('input.thumb_height').val(), 10);
    
            if (isNaN(height)) {
                height = '70%';
            } else {
                height = height + 50;
    
                if (!isNaN(thumb_height)) {
                    height = height + thumb_height;
                }
            }
    
            return height;
        };
    
    
        // IE10 treats placeholder text as the actual value of a textarea
        // http://stackoverflow.com/questions/13764607/html5-placeholder-attribute-on-textarea-via-$-in-ie10
        var fixIE10PlaceholderText = function() {
            $("textarea").each(function() {
                if ($(this).val() == $(this).attr('placeholder')) {
                    $(this).val('');
                }
            });
        };
    
        $(".metaslider .ms-toggle .hndle, .metaslider .ms-toggle .handlediv").on('click', function() {
            $(this).parent().toggleClass('closed');
        });

        // Switch tabs within a slide on space press
        $('.metaslider-ui').on('keypress', 'ul.tabs > li > a', function(event) {
            if (32 === event.which) {
                event.preventDefault();
                $(':focus').trigger('click');
            }
        });

        // Event to switch tabs within a slide
        $(".metaslider-ui").on('click', 'ul.tabs > li > a', function(event) {
            event.preventDefault();
            var tab = $(this);

            // Hide all the tabs
            tab.parents('.metaslider-ui-inner')
               .children('.tabs-content')
               .find('div.tab').hide();
               
               // Show the selected tab
               tab.parents('.metaslider-ui-inner')
               .children('.tabs-content')
               .find('div.' + tab.data('tab_id')).show();

            // Add the class
            tab.parent().addClass("selected")
               .siblings().removeClass("selected");
        });

        // Switch slider types when on the label and pressing enter
        $('.metaslider-ui').on('keypress', '.slider-lib-row label', function (event) {
            if (32 === event.which) {
                event.preventDefault();
                $('.slider-lib-row #' + $(this).attr('for')).trigger('click');
            }
        });
    
        // show the confirm dialogue
        $(".metaslider").on('click', '.delete-slider', function() {
            return confirm(metaslider.confirm);
        });
    
        // AJAX save & preview
        $(".metaslider form").find("button[type=submit]").on("click", function(e) {
            e.preventDefault();
    
            $(".metaslider .spinner").show().css('visibility', 'visible');
            $(".metaslider input[type=submit]").attr("disabled", "disabled");
    
            // update slide order
            $(".metaslider .left table").trigger('updateSlideOrder');
    
            fixIE10PlaceholderText();
    
            // get some values from elements on the page:
            var the_form = $(this).parents("form");
            var data = the_form.serialize();
            var url = the_form.attr("action");
            var button = $(this);
    
            $.ajax({
                type: "POST",
                data : data,
                cache: false,
                url: url,
                success: function(data) {
                    var response = $(data);
                    $.when($(".metaslider .left table").trigger("resizeSlides")).done(function() {
    
                        $("button[data-thumb]", response).each(function() {
                            var $this = $(this);
                            var editor_id = $this.attr("data-editor_id");
                            $("button[data-editor_id=" + editor_id + "]")
                                .attr("data-thumb", $this.attr("data-thumb"))
                                .attr("data-width", $this.attr("data-width"))
                                .attr("data-height", $this.attr("data-height"));
                        });
    
                        fixIE10PlaceholderText();
    
                        if ("ms-preview" === button.prop("id")) {
                            $.colorbox({
                                iframe: true,
                                href: metaslider.iframeurl + "&slider_id=" + button.data("slider_id"),
                                transition: "elastic",
                                innerHeight: getLightboxHeight(),
                                innerWidth: getLightboxWidth(),
                                scrolling: false,
                                fastIframe: false
                            });
                        }
    
                    });
                }
            });
        });

    // UI/Feedback

    // Events for the slideshow title
    $('.metaslider .nav-tab-active input[name="title"]').on('focusin', function() {

        // Expand the input box when a user wants to edit a slider title
        $(this).css('width', ($(this).val().length + 1) * 9);
    }).on('focusout', function() {

        // Retract and save the slideshow title
        $(this).css('width', 150);
        $("#ms-save").trigger('click');
    }).on('keypress', function() {

        // Pressing enter on the slide title saves it and focuses outside.
        if (13 === event.which) {
            event.preventDefault();
            $("#ms-save").trigger('click');
            $("button.add-slide").focus();
        }
    });


    // Bind the slider title to the input.
    $('.metaslider input[name="title"]').on('input', function(event) {
        event.preventDefault();

        var title = new MS_Binder(".slider-title > h3");
        title.bind($(this).val());
    });
});

/**
 * Various helper functions to use throughout
 */
var MetaSlider_Helpers = {

    /**
     * Various helper functions to use throughout
     */
    capitalize: function(string) {
        return string.replace(/\b\w/g, function(l){ return l.toUpperCase(); });
    },

    /**
     * Sets some basic loading state UI elements of the app. Currently,
     * it only enables or disables the input and shows a loading spinner.
     * @property {boolean} state 
     */    
    loading: function(state) {
        if (state) {
            jQuery(".metaslider .spinner").show().css('visibility', 'visible');
            jQuery(".metaslider button[type=submit]").attr('disabled', 'disabled');
        } else {
            jQuery(".metaslider .spinner").hide().css('visibility', '');
            jQuery(".metaslider button[type=submit]").removeAttr("disabled");
        }
    },
};

/**
 * Simple view binder
 * var elm = new MS_Binder("#selector");
 * elm.bind(200);
 */
var MS_Binder = function(selector) {
    this.dom = document.querySelector(selector);
    this.value = null;
};
 
MS_Binder.prototype.bind = function(value){
    if (value === this.value) return;
     
    this.value = value;
    this.dom.innerText = this.value;
};

/**
 * Simple notifications
 * var notice = new MS_Notification("Slide Deleted", "click to undo", 'img.jpg', 'success');
 * Can use a custom function for the callback as well
 * requires jQuery
 */
var MS_Notification = function(message, submessage, image, _classname) {
    this.panel = document.getElementById('ms-notifications');
    if (!this.panel) {
        this.panel = document.createElement('div');
        this.panel.id = "ms-notifications";
    }
    this.notice = jQuery('<div class="ms-notification"><div class="ms-notification-content"><h3></h3><p></p></div><div class="img"></div></div>');
    this.notice.find('h3').text(message);
    this.notice.find('p').text(submessage);

    // If there is an image, let's add it.
    if (('undefined' !== typeof image) && image.length) {
        this.notice.addClass('has-image')
        .find('.img')
        .append('<img width=50 height=50 src="' + image + '">');
    }

    // TODO add an option for svg
    
    // If an extra class is set, set it
    ('undefined' !== typeof _classname) && this.notice.addClass(_classname);
    
    // Append the panel to the body and
    jQuery(this.panel).appendTo(jQuery('body'));
};

/**
 * Hide a notification
 */
MS_Notification.prototype.hide = function() {
    var _this = this;
    _this.notice.addClass('finished');
    this.notice.fadeOut(500, function () {
        _this.notice.remove();
    });
};

/**
 * Launch a notification and add a click event
 * @param int delay the time in milliseconds
 * @param string callback a method on the object or anon function
 */
MS_Notification.prototype.fire = function(delay, callback) {
    var _this = this;
    var _callback = ('undefined' !== typeof callback) ? callback : 'hide';

    // Prepend this to the notification stack
    this.notice.prependTo(this.panel);

    // Automatically hide after the delay
    this.timeout = setTimeout(function() {
        _this.hide();
    }, delay);

    // Clear this timeout on click
    this.notice.on('click', function() {
        clearTimeout(_this.timeout);
    });

    // Pause the timeout on hover
    this.notice.on('mouseenter', function() {
        clearTimeout(_this.timeout);
    });
    
    // Restart the timeout after leaving
    this.notice.on('mouseleave', function() {
        _this.timeout = setTimeout(function() {
            _this.hide();
        }, delay);
    });

    // If callback is a method
    if (MS_Notification.prototype.hasOwnProperty(_callback)) {
        this.notice.on('click', function() {
            if ('hide' !== _callback) {
                _this.hide();
            }
            MS_Notification.call(_this[_callback]());
        });
    } else {
        
        // If the callback is a custom function
        this.notice.on('click', function() {
            _this.hide();
            _callback();
        });
    }
};