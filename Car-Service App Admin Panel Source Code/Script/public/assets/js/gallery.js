//
// Product Gallery Images
//  
    
    var selectedFiles = [];

	function readURL(input) {
		if (input.files && input.files.length > 0) {
			$('#image-preview').empty(); // Clear previous images
			selectedFiles = Array.from(input.files);

			for (var i = 0; i < input.files.length; i++) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var imageSrc = e.target.result;
					$('#image-preview').append('<div class="image-container d-flex flex-column mt-5 mb-5"><button class="remove-btn border-0 rounded-circle w-30px h-30px"><i class="ki-outline ki-cross text-danger fs-3" style="line-height:1.7em"></i></button><img src="' + imageSrc + '" alt="your image" class="bg-light-primary ms-2"/></div>');
				}
				reader.readAsDataURL(input.files[i]);
			}
		}
	}

	$("#imgInp").change(function() {
		readURL(this);
	});

	// Remove button functionality
	$(document).on("click", ".remove-btn", function() {
		var container = $(this).parent(".image-container");
		var index = container.index();
		container.remove();
		// Remove the corresponding file from selectedFiles array
		selectedFiles.splice(index, 1);
	});

	// Submitting the form
	$('form').submit(function(event) {
		var input = document.getElementById('imgInp');
		var newFileList = new DataTransfer();
		for (var i = 0; i < selectedFiles.length; i++) {
			newFileList.items.add(selectedFiles[i]);
		}
		input.files = newFileList.files;
	});


//
// Shipping Method
//

jQuery('input[name=shipping_method]').change(function(){
	if(jQuery(this).val() == 'free_shipping'){
		jQuery('#free_shipping_sec,.free_shipping_sec').show();
		jQuery('#flat_rate_sec,#local_pickup_sec, .flat_rate_sec, .local_pickup_sec').attr('style',"display: none!important");
	}
	if(jQuery(this).val() == 'flat_rate'){
		jQuery('#flat_rate_sec,.flat_rate_sec').show();
		jQuery('#free_shipping_sec,#local_pickup_sec,.free_shipping_sec,.local_pickup_sec').attr('style',"display: none!important");
	}
	if(jQuery(this).val() == 'local_pickup'){
		jQuery('#local_pickup_sec,.local_pickup_sec').show();
		jQuery('#free_shipping_sec,#flat_rate_sec,.free_shipping_sec, .flat_rate_sec').attr('style',"display: none!important");
	}
});

jQuery(document).ready(function() {
    function toggleMinOrderSec(selectedValue) {
        jQuery('.min_order_sec').toggle(selectedValue === 'min_amount');
    }

    function setupDropdownEvents(dropdownSelector) {
        var selectedValue = jQuery(dropdownSelector).val();
        toggleMinOrderSec(selectedValue);
        jQuery(dropdownSelector).change(function() {
            toggleMinOrderSec(jQuery(this).val());
        });
    }

    setupDropdownEvents('#free_shipping_requires');
    setupDropdownEvents('#free_shipping_requires_2');
	toggleMinOrderSec(jQuery('#free_shipping_requires_2').val());
});



jQuery(document).ready(function() {
	
	jQuery('#free_shipping_sec').show();
	jQuery('#flat_rate_sec,#local_pickup_sec').hide();

    // Function to show/hide sections based on selected shipping method
    function showHideSections(selectedMethod, formId) {
        // Hide all sections first within the current form
        jQuery('.free_shipping_sec, .flat_rate_sec, .local_pickup_sec', '#' + formId).hide();
        
        // Show the corresponding section based on the selected method within the current form
        if (selectedMethod === 'free_shipping') {
            jQuery('.free_shipping_sec', '#' + formId).show();
        } else if (selectedMethod === 'flat_rate') {
            jQuery('.flat_rate_sec', '#' + formId).show();
        } else if (selectedMethod === 'local_pickup') {
            jQuery('.local_pickup_sec', '#' + formId).show();
        }
    }

    // Iterate over each form
    jQuery('form[id^="edit_shipping_stepper_modal_"]').each(function() {
        var formId = jQuery(this).attr('id'); // Get the form ID

        // Get the selected shipping method on page load for the current form
        var selectedMethod = jQuery('input[name="shipping_method"]:checked', '#' + formId).val();

		console.log(selectedMethod);
        
        // Show/hide sections based on the selected method for the current form
        showHideSections(selectedMethod, formId);
    });
});









