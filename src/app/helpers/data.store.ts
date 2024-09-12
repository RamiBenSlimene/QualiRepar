import { Injectable } from "@angular/core";
import { SessionDataStore } from "../models/data-store";
import { ClaimRequest } from "../types/claim-request";
import { ValidationErrors } from "../types/validationErrors";

@Injectable({
    providedIn: 'root',
})
export class DataStore {

    // Set KEY 
    setKey(rememberMe: boolean, key: string) {
        if (rememberMe) {
            localStorage.setItem(SessionDataStore.key, key);
        } else {
            sessionStorage.setItem(SessionDataStore.key, key);
        }
    }
    // Get KEY
    getKey(): string | null {
        let key = sessionStorage.getItem(SessionDataStore.key);
        if (!key) {
            key = localStorage.getItem(SessionDataStore.key)
        }
        return key;
    }

    // Set productId in session storage
    setProductId(productId: string) {
        localStorage.setItem(SessionDataStore.productId, productId);
    }

    // Get productId from session storage
    getProductId(): string {
        return localStorage.getItem(SessionDataStore.productId) || '';
    }
    // Set product in session storage
    setProductName(product: string) {
        localStorage.setItem(SessionDataStore.productName, product);
    }

    // Get product from session storage
    getProductName(): string {
        return localStorage.getItem(SessionDataStore.productName) || '';
    }
    // Store selected product repair codes
    setSelectedProductRepairCodes(productCodes: string[]) {
        localStorage.setItem(SessionDataStore.selectedProductRepairCodes, JSON.stringify(productCodes));
    }

    // Retrieve selected product repair codes
    getSelectedProductRepairCodes(): string[] {
        const codesString = localStorage.getItem(SessionDataStore.selectedProductRepairCodes);
        return codesString ? JSON.parse(codesString) : [];
    }

    // Store selected product symptoms
    setSelectedProductSymptoms(symptoms: string[]) {
        localStorage.setItem(SessionDataStore.selectedProductSymptoms, JSON.stringify(symptoms));
    }

    // Retrieve selected product symptoms
    getSelectedProductSymptoms(): string[] {
        const symptomsString = localStorage.getItem(SessionDataStore.selectedProductSymptoms);
        return symptomsString ? JSON.parse(symptomsString) : [];
    }

    // Set brandId in session storage
    setBrandId(brandId: string) {
        localStorage.setItem(SessionDataStore.brandId, brandId);
    }

    // Set brandId in session storage
    getBrandId(): string {
        return localStorage.getItem(SessionDataStore.brandId) || '';
    }
    // Set brandId in session storage
    setBrandName(brand: string) {
        localStorage.setItem(SessionDataStore.brandName, brand);
    }

    // Get brand from session storage
    getBrandName(): string {
        return localStorage.getItem(SessionDataStore.brandName) || '';
    }
    // Set supportAmount in session storage
    setSupportAmount(supportAmount: string) {
        localStorage.setItem(SessionDataStore.supportAmount, supportAmount);
    }

    // Get supportAmount from session storage
    getSupportAmount(): string {
        return localStorage.getItem(SessionDataStore.supportAmount) || '';
    }

    // Set organizationId in session storage
    setOrganizationId(organizationId: string) {
        localStorage.setItem(SessionDataStore.organizationId, organizationId);
    }

    // Get organizationId from session storage
    getOrganizationId(): string {
        return localStorage.getItem(SessionDataStore.organizationId) || '';
    }

    // Set Claim Id in storage
    setClaimId(claimId: string) {
        localStorage.setItem(SessionDataStore.claimId, claimId);
    }

    // Get Claim Id from storage
    getClaimtId(): string {
        return localStorage.getItem(SessionDataStore.claimId) || '';
    }
    // Delete Claim Id from storage
    deleteClaimtId() {
        localStorage.removeItem(SessionDataStore.claimId);
    }

    // Store selected product repair codes
    setAiInvoice(invoice: ClaimRequest) {
        sessionStorage.setItem(SessionDataStore.invoice, JSON.stringify(invoice));
    }

    // Retrieve selected product repair codes
    getAiInvoice(): ClaimRequest {
        const invoice = sessionStorage.getItem(SessionDataStore.invoice);
        return invoice ? JSON.parse(invoice) : [];
    }

    // Retrieve Validatores
    getValidatores(): string[] {
        const validatoresList = localStorage.getItem(SessionDataStore.validatores);
        return validatoresList ? JSON.parse(validatoresList) : [];
    }

    // Store Validatores
    setValidatores(validatores: string[]) {
        localStorage.setItem(SessionDataStore.validatores, JSON.stringify(validatores));
    }

    // Set Validation Errors
    setErrors(errors: ValidationErrors) {
        sessionStorage.setItem(SessionDataStore.errors, JSON.stringify(errors));
    }

    // Get Validation Errors
    getErrors(): ValidationErrors {
        const errors = sessionStorage.getItem(SessionDataStore.errors);
        return errors !== null ? JSON.parse(errors) : [];
    }

}