// Select all input values when click
export const selectAllInlineText = (e) => {
    e.target.focus();
    e.target.select();
    // document.execCommand('selectAll', false, null);
};
