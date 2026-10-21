let dataTable = new simpleDatatables.DataTable(
  document.getElementById("table1"),
  {
    // Add Bootstrap 5 classes to the generated controls
    classes: {
      selector: "datatable-selector form-select",
      input: "datatable-input form-control",
      paginationList: "datatable-pagination-list pagination pagination-primary",
      paginationListItem: "datatable-pagination-list-item page-item",
      paginationListItemLink: "datatable-pagination-list-item-link page-link",
      active: "datatable-active active",
      disabled: "datatable-disabled disabled",
    },
  }
)

// Move "per page dropdown" selector element out of label
// to make it work with bootstrap 5.
function adaptPageDropdown() {
  const selector = dataTable.wrapperDOM.querySelector(".datatable-selector")
  selector.parentNode.parentNode.insertBefore(selector, selector.parentNode)
}

dataTable.on("datatable.init", adaptPageDropdown)
