/**************************************************************** 
    * Quill Editor
*****************************************************************/

// Get the hidden input field
function myFunction() {
    var editor = document.getElementsByClassName('ql-editor')[0].innerHTML
    var about = document.querySelector('input[name=description]');
    about.value = editor
};

// Quill editor Toolbar options
const toolbarOptions = [
    ['bold', 'italic', 'underline'], // toggled buttons
    ['blockquote', 'code-block'], // blocks
    ['image'],//Image
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }], // lists
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // headings
    [{ 'font': [] }], // font family
    [{ 'align': [] }],  // text align
];

// Quill editor
const quill = new Quill('#description', {
    modules: {
        toolbar: toolbarOptions
    },
    placeholder: 'Compose an epic...',
    theme: 'snow', // or 'bubble'
});

// Paste plaintext into the editor
quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
    var plaintext = node.innerText
    var Delta = Quill.import('delta')
    return new Delta().insert(plaintext)
})

// Get the hidden input field
var form = document.querySelector("form");
var hiddenInput = document.querySelector('#hiddenInput');

// On form submission, fill the hidden input with the editor's content
form.addEventListener('submit', function (e) {
    hiddenInput.value = quill.root.innerHTML;
});