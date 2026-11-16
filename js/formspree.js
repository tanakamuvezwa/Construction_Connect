/**
 * Formspree Integration Service (Vanilla JS / Ajax)
 * Form Endpoint: https://formspree.io/f/mljbjywj
 * 
 * Implements Formspree AJAX pattern with:
 * - data-fs-field: input validation & aria-invalid
 * - data-fs-error: field & form-level error feedback
 * - data-fs-success: success message display
 * - data-fs-submit-btn: loading state & disabling
 * - Local backup logging to ZimboData for Admin review
 */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mljbjywj';

const FormspreeService = {
  endpoint: FORMSPREE_ENDPOINT,

  /**
   * Submit form data via AJAX to Formspree endpoint
   * @param {HTMLFormElement} form 
   * @param {Object} extraData Optional custom key-value pairs (e.g. formType, source)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async submitForm(form, extraData = {}) {
    const submitBtn = form.querySelector('[data-fs-submit-btn]') || form.querySelector('button[type="submit"]');
    const successBox = form.querySelector('[data-fs-success]') || form.parentElement.querySelector('[data-fs-success]');
    const globalErrorBox = form.querySelector('[data-fs-error=""]') || form.querySelector('[data-fs-error="form"]');
    
    // Clear previous errors
    this.clearErrors(form);
    if (successBox) successBox.style.display = 'none';

    // Disable button & show spinner state
    let originalBtnText = '';
    if (submitBtn) {
      originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.setAttribute('data-loading', 'true');
      submitBtn.innerHTML = `
        <span class="fs-spinner"></span>
        <span>Sending to Formspree...</span>
      `;
    }

    try {
      // Gather form fields
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        if (payload[key]) {
          if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
          payload[key].push(value);
        } else {
          payload[key] = value;
        }
      });

      // Merge extra metadata (e.g., source, timestamp, app name)
      Object.assign(payload, {
        _source: 'Construction_Connect_Zimbo',
        _submissionDate: new Date().toISOString(),
        ...extraData
      });

      // Send to Formspree via AJAX (Fetch API)
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      // Check Formspree response
      if (response.ok) {
        // Record submission locally for Admin backend viewing
        if (window.ZimboData && typeof window.ZimboData.recordSubmission === 'function') {
          window.ZimboData.recordSubmission({
            formType: extraData.formType || form.id || 'Website Inquiry',
            data: payload,
            formspreeId: 'mljbjywj'
          });
        }

        // Show success state
        if (successBox) {
          successBox.innerHTML = `
            <div class="alert alert-success">
              <strong>✓ Message received!</strong> Your request has been securely delivered to Formspree and the manufacturer team will be in touch promptly.
            </div>
          `;
          successBox.style.display = 'block';
        }

        form.reset();

        return { success: true, data: result };
      } else {
        // Handle Formspree validation or rate-limit errors
        let errorMsg = 'Oops! There was a problem submitting your form to Formspree.';
        if (result && Array.isArray(result.errors)) {
          result.errors.forEach(err => {
            const fieldEl = form.querySelector(`[name="${err.field}"]`);
            const errSpan = form.querySelector(`[data-fs-error="${err.field}"]`);
            if (fieldEl) fieldEl.setAttribute('aria-invalid', 'true');
            if (errSpan) {
              errSpan.textContent = err.message;
              errSpan.style.display = 'block';
            }
          });
          errorMsg = result.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ');
        } else if (result && result.error) {
          errorMsg = result.error;
        }

        if (globalErrorBox) {
          globalErrorBox.innerHTML = `<div class="alert alert-error">${escapeHtml(errorMsg)}</div>`;
          globalErrorBox.style.display = 'block';
        }

        return { success: false, error: errorMsg };
      }
    } catch (networkError) {
      console.error('Formspree network error:', networkError);
      
      // Fallback: Even if offline or network fails, persist locally for Admin panel
      if (window.ZimboData && typeof window.ZimboData.recordSubmission === 'function') {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        window.ZimboData.recordSubmission({
          formType: (extraData.formType || form.id || 'Inquiry') + ' (Offline fallback)',
          data: payload,
          formspreeId: 'mljbjywj'
        });
      }

      const fallbackMsg = 'Network error while contacting Formspree. Your details were safely cached in local storage for the admin.';
      if (globalErrorBox) {
        globalErrorBox.innerHTML = `<div class="alert alert-warning">${fallbackMsg}</div>`;
        globalErrorBox.style.display = 'block';
      }

      return { success: false, error: fallbackMsg };
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('data-loading');
        submitBtn.innerHTML = originalBtnText;
      }
    }
  },

  clearErrors(form) {
    form.querySelectorAll('[data-fs-field]').forEach(f => f.removeAttribute('aria-invalid'));
    form.querySelectorAll('[data-fs-error]').forEach(e => {
      e.textContent = '';
      e.style.display = 'none';
    });
  },

  /**
   * Direct payload submission without a raw DOM form (e.g. from checkout or custom action)
   */
  async sendDirect(payload) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          _source: 'Construction_Connect_Direct',
          _timestamp: new Date().toISOString()
        })
      });
      return await response.json();
    } catch (err) {
      console.warn('Direct Formspree post failed:', err);
      return { error: err.message };
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.FormspreeService = FormspreeService;
