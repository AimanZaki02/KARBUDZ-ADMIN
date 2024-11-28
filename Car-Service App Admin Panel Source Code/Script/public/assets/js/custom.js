// Change product status color
jQuery(document).ready(function () {
    jQuery('#selectStatus').change(function () {
        var status = {
            'published': 'bg-success',
            'draft': 'bg-primary',
            'scheduled': 'bg-warning',
            'inactive': 'bg-danger'
        };
        var selectedValue = jQuery(this).val();
        var bgClass = status[selectedValue] || 'bg-info';
        jQuery('#kt_ecommerce_add_product_status').removeClass('bg-primary bg-success bg-danger bg-warning bg-info').addClass(bgClass);
    });
});


// show/hide datepicker
jQuery(document).ready(function () {
    jQuery('#selectStatus').change(function () {
        if (jQuery(this).val() == 'scheduled') {
            jQuery('.status_datepicker').removeClass('d-none');
        }
        else {
            jQuery('.status_datepicker').addClass('d-none');
        }
    });
});

// Product tags
var input2 = document.querySelector("#kt_tagify_2");
new Tagify(input2);


// set Datepicker
jQuery(document).ready(function() {
    jQuery("#datepicker,#flashstartdate,#flashenddate").flatpickr({
        // enableTime: true,
        dateFormat: "d-m-Y",
        // time_24hr: true
    });
});
