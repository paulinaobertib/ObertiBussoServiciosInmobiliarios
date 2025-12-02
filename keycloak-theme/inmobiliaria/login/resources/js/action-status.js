/**
 * Action status page JavaScript functionality
 * Handles automatic redirect after action completion
 */

<#if url.redirectUri??>
window.addEventListener('load', () => {
  setTimeout(() => {
    window.location.href = '${url.redirectUri?js_string}';
  }, 1500);
});
</#if>