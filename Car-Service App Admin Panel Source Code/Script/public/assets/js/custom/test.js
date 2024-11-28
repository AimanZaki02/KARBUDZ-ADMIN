
  window.onload = function() {
    var singlePlanElement = document.getElementById("singleplan");
    var weeklyPlanElement = document.getElementById("weeklyplan");

    if (singlePlanElement && singlePlanElement.checked) {
      console.log("Singleplan load");
      showSinglePlanDiv();
    } else if (weeklyPlanElement && weeklyPlanElement.checked) {
      console.log("Weeklyplan load");
      showWeeklyPlanDiv();
    }
  };

  function showSinglePlanDiv() {
    console.log("Singleplan show");

    document.getElementById("workout").className = document.getElementById("workout").className.replace(/\bd-none\b/g, '');
    document.getElementById("kt_docs_repeater_nested").className += " d-none";
  }

  function showWeeklyPlanDiv() {
    console.log("Weeklyplan show");

    document.getElementById("workout").className += " d-none";
    document.getElementById("kt_docs_repeater_nested").className = document.getElementById("kt_docs_repeater_nested").className.replace(/\bd-none\b/g, '');
  }

// <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
// <script src="<%= process.env.BASE_URL %>/assets/plugins/global/plugins.bundle.js"></script>
// <script src="<%= process.env.BASE_URL %>/assets/js/scripts.bundle.js"></script>
// <script src="<%= process.env.BASE_URL %>/assets/plugins/custom/formrepeater/formrepeater.bundle.js"></script>


  // instructions
  jQuery('#kt_docs_repeater_advanced').repeater({
    initEmpty: false,

    defaultValues: {
      'text-input': 'foo'
    },

    show: function() {
      jQuery(this).slideDown();
    },

    hide: function(deleteElement) {
      if (confirm('Are you sure you want to delete this Instructions?')) {
        jQuery(this).slideUp(deleteElement);
      }
    }
  });

  // singleplan
  $('#workout').repeater({
    initEmpty: false,
    defaultValues: {
      'text-input': 'foo'
    },
    show: function() {
      $(this).slideDown();
      applyEventListeners(); // Apply event listeners for each newly added row
    },
    hide: function(deleteElement) {
      $(this).slideUp(deleteElement);
    }
  });

  // weeklyplan
  $('#kt_docs_repeater_nested').repeater({
    repeaters: [{
      selector: '.inner-repeater',
      show: function() {
        $(this).slideDown();
      },

      hide: function(deleteElement) {
        $(this).slideUp(deleteElement);
      },
      repeaters: [{ // Nested repeater configuration
        selector: '.subinner-repeater', // Selector for the nested repeater
        show: function() {
          $(this).slideDown();
        },
        hide: function(deleteElement) {
          $(this).slideUp(deleteElement);
        }
      }]
    }],

    show: function() {
      $(this).slideDown();
      applyweeklyworkout()
    },

    hide: function(deleteElement) {
      $(this).slideUp(deleteElement);
    }
  });

  // Function to apply event listeners for radio buttons
  function applyEventListeners() {
    // Bind event listener to parent element and delegate to radio buttons
    $('#workout').on('change', '.form-check-input', function() {
      var $this = $(this);
      var $repsInput = $this.closest('.form-group').find('#repsInput');
      var $setsInput = $this.closest('.form-group').find('#setsInput');
      var $timeInput = $this.closest('.form-group').find('#timeInput');

      if ($this.val() === 'Rep Based Sets') {
        $repsInput.removeClass('d-none');
        $setsInput.removeClass('d-none');
        $timeInput.addClass('d-none');
      } else if ($this.val() === 'Time Based') {
        $repsInput.addClass('d-none');
        $setsInput.addClass('d-none');
        $timeInput.removeClass('d-none');
      }
    });
  }
  
  // Function to apply event listeners for radio buttons
  function applyweeklyworkout() {
    // Bind event listener to parent element and delegate to radio buttons
    $('#kt_docs_repeater_nested').on('change', '.form-check-input', function() {
      var $this = $(this);
      var $repsInput = $this.closest('.form-group').find('#repsInputweekly');
      var $setsInput = $this.closest('.form-group').find('#setsInputweekly');
      var $timeInput = $this.closest('.form-group').find('#timeInputweekly');

      if ($this.val() === 'Rep Based Sets') {
        $repsInput.removeClass('d-none');
        $setsInput.removeClass('d-none');
        $timeInput.addClass('d-none');
      } else if ($this.val() === 'Time Based') {
        $repsInput.addClass('d-none');
        $setsInput.addClass('d-none');
        $timeInput.removeClass('d-none');
      }
    });
  }

  function toggleWorkoutRepeater(show) {
    if (show) {
      $('#workout').removeClass('d-none');
    } else {
      $('#workout').addClass('d-none');
    }
  }

  function toggleWorkoutRepeater1(show) {
    if (show) {
      $('#kt_docs_repeater_nested').removeClass('d-none');
    } else {
      $('#kt_docs_repeater_nested').addClass('d-none');
    }
  }

  // Event listener for the "Single Plan" radio button
  $('#singleplan12').change(function() {
    if ($(this).is(':checked')) {
      toggleWorkoutRepeater(true); // Show the workout form repeater
      toggleWorkoutRepeater1(false); // Hide the nested form repeater
    }
  });

  // Event listener for the "Weekly Plan" radio button
  $('#weeklyplan12').change(function() {
    if ($(this).is(':checked')) {
      toggleWorkoutRepeater(false); // Hide the workout form repeater
      toggleWorkoutRepeater1(true); // Show the nested form repeater
    }
  });

  // Apply event listeners for the first time
  applyEventListeners();
  applyweeklyworkout();

  toggleWorkoutRepeater(false);