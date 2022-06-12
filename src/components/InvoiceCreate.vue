<template>
  <div>
    <b-form @submit.prevent="createInvoice">
      <b-row class="my-1" align-v="baseline">
        <b-col sm="2">
          <label class="sr-only" for="inline-form-input-name"
            >Invoice Name</label
          >
        </b-col>
        <b-col sm="4">
          <b-form-input
            id="inline-form-input-name"
            class="mb-2 mr-sm-2 mb-sm-0"
            placeholder=""
            v-model="invoiceName"
            required
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row class="my-1" align-v="baseline">
        <b-col sm="2">
          <label class="sr-only" for="inline-form-input-name">Date</label>
        </b-col>
        <b-col sm="4">
          <b-form-datepicker
            id="example-datepicker"
            :date-format-options="{
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }"
            v-model="date"
            class="mb-2"
            required
          ></b-form-datepicker>
        </b-col>
      </b-row>

      <b-row class="mt-2 text-center" align-v="baseline">
        <b-col sm="1"> No </b-col>
        <b-col sm="3"> Item Name </b-col>
        <b-col sm="2"> No of Item </b-col>
        <b-col sm="2"> Price(Ks) </b-col>
        <b-col sm="3"> Total(Ks) </b-col>
        <b-col sm="1"> </b-col>
      </b-row>

      <b-row
        v-for="(item, i) in invoiceItemList"
        :key="i"
        class="my-2 text-center"
        align-v="baseline"
      >
        <b-col sm="1"> {{ i + 1 }} </b-col>
        <b-col sm="3">
          <b-form-input class="mr-4" v-model="item.name" required>
          </b-form-input>
        </b-col>
        <b-col sm="2">
          <b-form-input
            type="number"
            min="0"
            class="mr-4 text-right"
            v-model="item.qty"
          >
          </b-form-input>
        </b-col>
        <b-col sm="2">
          <b-form-input type="number" min="0" class="mr-4" v-model="item.price"> </b-form-input>
        </b-col>
        <b-col sm="3">
          {{ item.qty * item.price }}
        </b-col>

        <b-col sm="1">
          <b-icon
            icon="trash-fill"
            font-scale="1.5"
            style="cursor: pointer"
            variant="danger"
            @click="removeItem(i)"
          ></b-icon>
        </b-col>
      </b-row>

      <b-button size="sm" variant="outline-primary" @click="addInvoiceItem"
        >Add Item</b-button
      >
      <hr />

      <b-row align-h="end" class="mt-3">
        <b-col cols="2" class="text-right" style="text-align: right"
          >Sub Total:</b-col
        >
        <b-col cols="2" class="">{{ subTotal }} Ks</b-col>
      </b-row>
      <b-row align-h="end" class="my-1 text-right" align-v="baseline">
        <b-col cols="2" class="" style="text-align: right">Tax (Ks):</b-col>
        <b-col cols="2" class="">
          <b-form-input
            v-model="tax"
            type="number"
            min="0"
            style="width: 80px"
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row align-h="end">
        <b-col cols="2" class="text-right" style="text-align: right"
          >Total:</b-col
        >
        <b-col cols="2" class="">{{ total }} Ks</b-col>
      </b-row>

      <hr />

      <div class="w-100">
        <b-row>
          <b-col cols="4">
            <b-overlay
              :show="loading"
              rounded
              opacity="0.6"
              spinner-small
              spinner-variant="primary"
              class="d-inline-block"
            >
              <b-button
                :disabled="loading"
                v-if="isCreate"
                type="submit"
                variant="primary"
                >Create</b-button
              >
              <b-button
                :disabled="loading"
                v-else
                type="submit"
                variant="primary"
                >Update</b-button
              >
            </b-overlay>
          </b-col>
        </b-row>
      </div>
    </b-form>
  </div>
</template>

<script>
import { db } from "../firebase";
import {
  doc,
  collection,
  //   getDocs,
  //   deleteDoc,
  //   query,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

export default {
  props: {
    isCreate: {
      default: true,
      type: Boolean,
    },
    docId: {
      default: "",
      type: String,
    },
    invoiceNameProp: {
      default: "",
      type: String,
    },
    dateProp: {
      default: "", //this.getTodayDate(),
      type: String,
    },
    taxProp: {
      default: 0,
      type: Number,
    },
    invoiceItemProp: {
      default: () => {
        return {
          name: "",
          price: "",
          qty: 0,
          total: "",
        };
      },
      type: Object,
    },
    invoiceItemListProp: {
      type: Array,
      default: () => {
        return [
          {
            name: "",
            price: 0.0,
            qty: 0,
            total: "",
          },
        ];
      },
    },
  },
  data() {
    return {
      loading: false,
      invoiceName: this.invoiceNameProp,
      date: this.dateProp,
      tax: this.taxProp,
      invoiceItem: this.invoiceItemProp,
      invoiceItemList: this.invoiceItemListProp,
    };
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
    getTodayDate() {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var yyyy = today.getFullYear();
      return (yyyy + "-" + mm + "-" + dd).toString();
    },
    addInvoiceItem() {
      this.invoiceItemList.push({
        name: "",
        price: 0.0,
        qty: 0,
        total: "",
      });
    },
    removeItem(index) {
      this.invoiceItemList.splice(index, 1);
    },
    async createInvoice() {
      this.loading = true;
      let invoice = {
        invoiceName: this.invoiceName,
        date: this.date,
        items: this.invoiceItemList,
        subTotal: this.subTotal,
        tax: this.tax,
        total: this.total,
      };

      try {
        if (this.isCreate) {
          invoice.createAt = Timestamp.now();
            await addDoc(collection(db, "invoice"), invoice);

        //   console.log("Document written with ID: ", docRef.id);
          this.$bvToast.toast("Create Success", {
            title: `Create`,
            variant: "success",
            solid: true,
          });
        this.$store.commit("SHOW_ALERT", {show: true, msg: "Create Sucess"})
        } else {
          console.log("update");
          invoice.updateAt = Timestamp.now();
          //   const  ref = await updateDoc(collection(db, "invoice",));
          const frankDocRef = doc(db, "invoice", this.docId);

          await updateDoc(frankDocRef, {
            ...invoice,
          })
        this.$store.commit("SHOW_ALERT", {show: true, msg: "Update Sucess"})
        }
        // this.$refs["create-modal"].hide();
        this.$emit("closeModal");
        // this.getData();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },
  },
};
</script>
