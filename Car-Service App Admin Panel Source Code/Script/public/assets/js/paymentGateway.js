jQuery(document).ready(function() {

    // Toggle payment gateway mode
    function toggleMode(paymentMethod) {
        let mode = jQuery(`input[name=${paymentMethod}_mode]:checked`).val();
        let testClass = `.${paymentMethod}-test-mode`;
        let liveClass = `.${paymentMethod}-live-mode`;
        
        if(mode == 'testMode'){
            jQuery(liveClass).hide();
            jQuery(testClass).show();
        }
        if(mode == 'liveMode'){
            jQuery(testClass).hide();
            jQuery(liveClass).show();
        }

        jQuery(`input[name=${paymentMethod}_mode]`).change(function(){
            if(jQuery(this).val() == 'testMode'){
                jQuery(testClass).show();
                jQuery(liveClass).hide();
            }
            if(jQuery(this).val() == 'liveMode'){
                jQuery(testClass).hide();
                jQuery(liveClass).show();
            }
        });
    }

    toggleMode('paypal');
    toggleMode('stripe');
    toggleMode('razorpay');
});
