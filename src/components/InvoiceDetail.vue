<template>
  <div>
    <div id="print">
      <b-row class="my-1" style="font-weight: bold" align-v="baseline">
        <b-col cols="3">
          <label class="sr-only" for="inline-form-input-name"
            >Invoice Name :</label
          >
        </b-col>
        <b-col cols="4">
          <label class="sr-only" for="inline-form-input-name">{{
            invoiceName
          }}</label>
        </b-col>
      </b-row>
      <b-row class="my-1" align-v="baseline" style="font-weight: bold">
        <b-col cols="3">
          <label class="sr-only" for="inline-form-input-name">Date :</label>
        </b-col>
        <b-col cols="4">
          <label class="sr-only" for="inline-form-input-name">{{ date }}</label>
        </b-col>
      </b-row>
      <br />

      <b-row
        class="mt-2 text-center mx-0 pb-2"
        align-v="baseline"
        style="border-bottom: 1px solid #c8c9ca; font-weight: bold"
      >
        <b-col cols="1"> No </b-col>
        <b-col cols="3"> Item Name </b-col>
        <b-col cols="2"> No of Item </b-col>
        <b-col cols="3"> Price(Ks) </b-col>
        <b-col cols="3"> Total(Ks) </b-col>
        <b-col cols="1"> </b-col>
      </b-row>
      <!-- <hr class="my-1" /> -->

      <b-row
        v-for="(item, i) in invoiceItemList"
        :key="i"
        class="my-2 text-center mx-0 pb-2"
        style="border-bottom: 1px solid #c8c9ca"
        align-v="baseline"
      >
        <b-col cols="1"> {{ i + 1 }} </b-col>
        <b-col cols="3">
          {{ item.name }}
        </b-col>
        <b-col cols="2">
          {{ item.qty }}
        </b-col>
        <b-col cols="3">
          {{ item.price }}
        </b-col>
        <b-col cols="3">
          {{ item.qty * item.price }}
        </b-col>
      </b-row>

      <b-row align-h="end" class="mt-3">
        <b-col cols="4" class="text-right" style="text-align: right"
          >Sub Total:</b-col
        >
        <b-col cols="2" class="">{{ subTotal }} Ks</b-col>
      </b-row>
      <b-row align-h="end" class="my-1 text-right" align-v="baseline">
        <b-col cols="4" class="" style="text-align: right">Tax (Ks):</b-col>
        <b-col cols="2" class="">
          {{ tax }}
        </b-col>
      </b-row>
      <b-row align-h="end" style="font-weight: bold">
        <b-col cols="4" class="text-right" style="text-align: right"
          >Total:</b-col
        >
        <b-col cols="2" class="">{{ total }} Ks</b-col>
      </b-row>

      <hr />
    </div>

    <div class="w-100">
      <b-row>
        <b-col cols="4">
          <b-button variant="primary" @click="print">Print</b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    invoiceName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    invoiceItemList: {
      type: Array,
      required: true,
    },
    subTotal: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    tax: {
      type: String,
      required: true,
    },
  },

  methods: {
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
