<template>
  <div>
    <b-container>
      <div class="my-3 bg-light px-3 py-2">
        <b-row align-h="between">
          <b-col cols="6">
            <label
              class="font-weight-bold h3"
              style="float: left; margin-right: 16px"
              >Invoice Summary</label
            >
            <b-form-input
              class="mr-4"
              style="width: 200px; float: left; margin-right: 10px"
              v-model="filter"
            >
            </b-form-input>
            <b-button variant="primary" @click="(filter = ''), getData()"
              >Reset</b-button
            >
          </b-col>
          <b-col cols="3" align="right">
            <b-button variant="primary" class="mr-0" @click="showCreateModal"
              >Add New</b-button
            >
          </b-col>
        </b-row>
      </div>

      <div>
        <b-overlay :show="loading" rounded="sm">
          <b-table
            striped
            hover
            :fields="fields"
            :items="invoiceList"
            :filter="filter"
            show-empty
            :per-page="perPage"
            :current-page="currentPage"
            @filtered="onFiltered"
          >
            <template #empty="">
              <h4 class="text-center">No Data</h4>
            </template>
            <template #cell(index)="data">
              {{ perPage * (currentPage - 1) + data.index + 1 }}
            </template>

            <template #cell(items)="data">
              {{ data.item.items.length }}
            </template>

            <template #cell(action)="data" style="width: 100px">
              <b-button
                size="sm"
                variant="primary"
                @click="showEditModal(data.item)"
                >Edit</b-button
              >
              <b-button
                class="mx-1"
                size="sm"
                variant="danger"
                @click="showDeleteModal(data.item.id)"
                >Delete</b-button
              >
              <b-button
                size="sm"
                variant="info"
                @click="showDetailModal(data.item)"
                >Detail</b-button
              >
            </template>
          </b-table>

          <b-row align-h="end" align-v="baseline">
            <b-col sm="6" style="text-align: left">
              <vue-excel-xlsx
                :data="invoiceList"
                :columns="columns"
                :file-name="'invoice'"
                :file-type="'xlsx'"
                :sheet-name="'sheetname'"
                class="export"
                >Export Excel
              </vue-excel-xlsx>
            </b-col>
            <b-col sm="3" class="my-1 mr-auto" style="text-align: right">
              <b-form-group label-size="sm" class="mb-0">
                <b-form-select
                  id="per-page-select"
                  v-model="perPage"
                  :options="pageOptions"
                ></b-form-select>
              </b-form-group>
            </b-col>

            <b-col sm="3" class="my-1">
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                align="fill"
                size="sm"
                class="my-0"
              ></b-pagination>
            </b-col>
          </b-row>
        </b-overlay>
      </div>

      <!-- Invoice Create/Update Modal -->
      <b-modal
        :hide-footer="true"
        :no-close-on-backdrop="true"
        size="lg"
        ref="create-modal"
        id="modal-1"
        title="New Invoice"
      >
        <template #modal-header="{ close }">
          <h5 v-if="create">Add Invoice</h5>
          <h5 v-else>Edit Invoice</h5>
          <!-- Emulate built in modal header close button action -->
          <b-button size="sm" variant="outline-danger" @click="close()">
            Close
          </b-button>
        </template>

        <invoice-create
          :docId="docId"
          :date="getTodayDate()"
          :invoiceItemListProp="invoiceItemList"
          :invoiceItemProp="invoiceItem"
          :dateProp="date"
          :invoiceNameProp="invoiceName"
          :isCreate="create"
          :taxProp="+tax"
          @closeModal="closeModal"
        />
      </b-modal>

      <!-- Invoice Delete Modal -->
      <b-modal
        :hide-footer="true"
        :no-close-on-backdrop="true"
        size="sm"
        ref="delete-modal"
        id="modal-2"
      >
        <template #modal-header="{}">
          <h5>Delete</h5>
        </template>

        <b-overlay
          :show="loading"
          rounded
          opacity="0.6"
          spinner-small
          spinner-variant="primary"
          class="d-inline-block"
        >
          <div class="text-center">Are you sure to Delete?</div>
          <br />

          <b-row align-h="center">
            <b-col cols="auto">
              <b-button variant="primary" @click="deleteInvoice">Ok</b-button>
            </b-col>
            <b-col cols="auto">
              <b-button variant="" @click="$refs['delete-modal'].hide()"
                >Cancel</b-button
              >
            </b-col>
          </b-row>
        </b-overlay>
      </b-modal>

      <!-- Invoice Detail Modal -->
      <b-modal
        :hide-footer="true"
        :no-close-on-backdrop="true"
        size="lg"
        ref="detail-modal"
        id="modal-3"
      >
        <template #modal-header="{ close }">
          <h5>Invoice</h5>
          <b-button size="sm" variant="outline-danger" @click="close()">
            Close
          </b-button>
        </template>

        <invoice-detail
          :invoiceItemList="invoiceItemList"
          :date="date"
          :invoiceName="invoiceName"
          :subTotal="subTotal.toFixed(2).toString()"
          :total="total.toFixed(2).toString()"
          :tax="(+tax).toFixed(2).toString()"
        />
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import { db } from "./firebase";
import {
  doc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import InvoiceDetail from "./components/InvoiceDetail.vue";
import InvoiceCreate from "./components/InvoiceCreate.vue";

export default {
  components: { InvoiceDetail, InvoiceCreate },
  data() {
    return {
      loading: false,
      create: true,
      invoiceName: "",
      date: "",
      tax: 0,
      invoiceItem: {
        name: "",
        price: "",
        qty: 0,
        total: "",
      },
      invoiceItemList: [
        {
          name: "",
          price: 0.0,
          qty: 0,
          total: "",
        },
      ],
      fields: [
        "index",
        { key: "invoiceName", label: "Invoice Name" },
        { key: "date", label: "Date" },
        { key: "items", label: "Total Items" },
        { key: "subTotal", label: "Sub Total(Ks)" },
        { key: "tax", label: "Tax(Ks)" },
        { key: "total", label: "Total(Ks)" },
        { key: "action", label: "", thStyle: { width: "200px" } },
      ],
      invoiceList: [],
      docId: "",
      currentPage: 1,
      perPage: 3,
      pageOptions: [3, 5, 10, 15, { value: 100, text: "Show a lot" }],
      filter: null,
      totalRows: 0,
      columns: [
        {
          label: "Invoice Name",
          field: "invoiceName",
        },
        {
          label: "Date",
          field: "date",
        },
        {
          label: "Total Items",
          field: "items",
          dataFormat: this.itemFormat,
        },
        {
          label: "Sub Total",
          field: "subTotal",
        },
        {
          label: "Tax",
          field: "tax",
        },
        {
          label: "Total",
          field: "total",
        },
      ],
    };
  },
  created() {
    this.date = this.getTodayDate();
  },
  mounted() {
    this.getData();
  },
  computed: {
    subTotal() {
      return this.invoiceItemList.reduce((a, b) => a + +(b.price * b.qty), 0);
    },
    total() {
      return this.subTotal + +this.tax;
    },
  },
  methods: {
    itemFormat(item) {
      return item.length;
    },

    getTodayDate() {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var yyyy = today.getFullYear();
      return (yyyy + "-" + mm + "-" + dd).toString();
    },

    showCreateModal() {
      this.create = true;
      this.invoiceItemList = [
        {
          name: "",
          price: 0.0,
          qty: 0,
          total: "",
        },
      ];
      this.tax = 0;
      this.invoiceName = "";
      this.date = this.getTodayDate();
      this.tax = 0;
      this.$refs["create-modal"].show();
    },

    showDeleteModal(id) {
      this.docId = id;
      // console.log(this.docId);
      this.$refs["delete-modal"].show();
    },

    showEditModal(item) {
      this.create = false;
      this.invoiceItemList = item.items;
      this.tax = item.tax;
      this.invoiceName = item.invoiceName;
      this.date = item.date;
      this.tax = item.tax;
      this.docId = item.id;
      this.$refs["create-modal"].show();
    },

    showDetailModal(item) {
      this.invoiceItemList = item.items;
      this.tax = item.tax;
      this.invoiceName = item.invoiceName;
      this.date = item.date;
      this.tax = item.tax;
      this.docId = item.id;
      this.$refs["detail-modal"].show();
    },

    closeModal() {
      this.$refs["create-modal"].hide();
      this.getData();
    },

    async deleteInvoice() {
      this.loading = true;
      await deleteDoc(doc(db, "invoice", this.docId));
      this.$refs["delete-modal"].hide();
      
      this.$store.commit("SHOW_ALERT", { show: true, msg: "Delete Sucess" });
      this.getData();

    },

    async getData() {
      this.loading = true;
      this.invoiceList = [];

      try {
        const q = query(collection(db, "invoice"), orderBy("createAt", "desc"));

        const querySnapshot = await getDocs(q, {
          includeMetadataChanges: true,
        });
        querySnapshot.forEach((doc) => {
          // console.log(doc.id, " => ", doc.data());
          var data = doc.data();
          data.id = doc.id;
          this.invoiceList.push(data);
        });

        this.totalRows = this.invoiceList.length;
      } catch (error) {
        console.log("error");
      }

      this.loading = false;
    },

    onFiltered(items) {
      this.totalRows = items.length;
      this.currentPage = 1;
    },

    print() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("print").innerHTML;

      // Get all stylesheets HTML
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }

      // Open the print window
      const WinPrint = window.open(
        "",
        "",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
      );

      WinPrint.document.write(`
      <!DOCTYPE html>
        <html>
        <head>
            ${stylesHtml}
        </head>
        <body>
            ${prtHtml}
        </body>
        </html>`);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      //   WinPrint.close();
    },
  },
};
</script>

<style scoped>
.my-class {
  width: 100px !important;
}
.export {
  border-radius: 3px;
  border: none;
  background: #0d6efd;
  padding: 5px;
  color: #fff;
}
</style>
