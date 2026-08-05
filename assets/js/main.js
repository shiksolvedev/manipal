/* ========================
   Main JavaScript
======================== */

// ========================
// Google Sheets Webhook Integration
// ========================
// Set your Google Sheet Web App URL here
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxWGuOy6wgc3lP1sFao91xXTFri0gmncIjexZYb-kvHtZek0RuLV2nEpLi761rOC9h0/exec';

// ========================
// IP Address Tracking
// ========================
let userIpAddress = '';
const ipPromise = (async function fetchIpAddress() {
  const providers = [
    { url: 'https://api.ipify.org?format=json', key: 'ip' },
    { url: 'https://api64.ipify.org?format=json', key: 'ip' },
    { url: 'https://ipinfo.io/json', key: 'ip' },
    { url: 'https://freeipapi.com/api/json', key: 'ipAddress' },
    { url: 'https://api.db-ip.com/v2/free/self', key: 'ipAddress' },
    { url: 'https://httpbin.org/ip', key: 'origin' }
  ];
  for (const provider of providers) {
    try {
      const res = await fetch(provider.url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[provider.key]) {
          userIpAddress = data[provider.key];
          console.log('Successfully fetched IP address:', userIpAddress);
          return userIpAddress;
        }
      }
    } catch (err) {
      console.warn(`Unable to retrieve user IP address from ${provider.url}:`, err);
    }
  }
  return '';
})();

// ========================
// Campaign/UTM Tracking
// ========================
(function captureCampaign() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'campaign_id', 'campaign',
    'utm_keyword', 'keyword', 'utm_location', 'location', 'loc_physical_ms'
  ];
  
  utmParams.forEach(param => {
    const val = urlParams.get(param);
    if (val) {
      try {
        sessionStorage.setItem(param, val);
      } catch (e) {
        console.warn(`sessionStorage is not accessible for ${param}:`, e);
      }
    }
  });
})();


// ========================
// Navbar scroll effect
// ========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Scroll to top visibility
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  // Sticky mobile Apply Now button visibility
  const stickyApply = document.getElementById('stickyApply');
  if (stickyApply) {
    if (window.innerWidth <= 767 && window.scrollY > 400) {
      stickyApply.classList.add('visible');
    } else {
      stickyApply.classList.remove('visible');
    }
  }
});

// ========================
// Scroll to top
// ========================
document.getElementById('scrollTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================
// Hamburger / Mobile Nav
// ========================
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// ========================
// Modal logic
// ========================
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtns = document.querySelectorAll('[data-modal="open"]');
const closeModalBtn = document.getElementById('closeModal');

openModalBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

closeModalBtn?.addEventListener('click', () => {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
});

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ========================
// Courses Slider
// ========================
let currentCourse = 0;
const coursesSlider = document.getElementById('coursesSlider');

function getCourseMaxIndex() {
  if (!coursesSlider) return 0;
  const cards = coursesSlider.querySelectorAll('.coursesContainer');
  const visibleCount = window.innerWidth > 991 ? 3 : (window.innerWidth > 767 ? 2 : 1);
  return Math.max(0, cards.length - visibleCount);
}

document.getElementById('coursePrev')?.addEventListener('click', () => {
  if (!coursesSlider) return;
  const maxIndex = getCourseMaxIndex();
  if (currentCourse <= 0) {
    currentCourse = maxIndex;
  } else {
    currentCourse = currentCourse - 1;
  }
  scrollCoursesTo(currentCourse);
  startCourseAutoplay(); // Reset autoplay timer
});

document.getElementById('courseNext')?.addEventListener('click', () => {
  if (!coursesSlider) return;
  const maxIndex = getCourseMaxIndex();
  if (currentCourse >= maxIndex) {
    currentCourse = 0;
  } else {
    currentCourse = currentCourse + 1;
  }
  scrollCoursesTo(currentCourse);
  startCourseAutoplay(); // Reset autoplay timer
});

function scrollCoursesTo(index) {
  if (!coursesSlider) return;
  const cardEl = coursesSlider.querySelector('.coursesContainer');
  if (!cardEl) return;
  const cardWidth = cardEl.offsetWidth + 24; // width + gap
  coursesSlider.scrollTo({
    left: index * cardWidth,
    behavior: 'smooth'
  });
  updateCourseDots(index);
}

function updateCourseDots(index) {
  const dots = document.querySelectorAll('.course-dot');
  if (dots.length === 0) return;
  let targetDot = dots[0];
  let minDiff = Infinity;
  dots.forEach(dot => {
    const dotIdx = parseInt(dot.getAttribute('data-index') || '0', 10);
    const diff = Math.abs(dotIdx - index);
    if (diff < minDiff) {
      minDiff = diff;
      targetDot = dot;
    }
  });
  dots.forEach(d => {
    d.style.background = 'transparent';
    d.classList.remove('active');
  });
  if (targetDot) {
    targetDot.style.background = '#ff521d';
    targetDot.classList.add('active');
  }
}

// Wire dot clicks
document.querySelectorAll('.course-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const targetIdx = parseInt(dot.getAttribute('data-index') || '0', 10);
    currentCourse = targetIdx;
    scrollCoursesTo(currentCourse);
    startCourseAutoplay(); // Reset autoplay timer
  });
});

// Scroll sync
let isScrollingCourses;
coursesSlider?.addEventListener('scroll', () => {
  window.clearTimeout(isScrollingCourses);
  isScrollingCourses = setTimeout(() => {
    const cardEl = coursesSlider.querySelector('.coursesContainer');
    if (!cardEl) return;
    const cardWidth = cardEl.offsetWidth + 24;
    const scrolledIndex = Math.round(coursesSlider.scrollLeft / cardWidth);
    currentCourse = scrolledIndex;
    updateCourseDots(currentCourse);
  }, 100);
});

// Autoplay
let courseInterval;

function startCourseAutoplay() {
  stopCourseAutoplay();
  courseInterval = setInterval(() => {
    if (!coursesSlider) return;
    const maxIndex = getCourseMaxIndex();
    if (currentCourse >= maxIndex) {
      currentCourse = 0;
    } else {
      currentCourse = currentCourse + 1;
    }
    scrollCoursesTo(currentCourse);
  }, 4000);
}

function stopCourseAutoplay() {
  if (courseInterval) {
    clearInterval(courseInterval);
  }
}

if (coursesSlider) {
  startCourseAutoplay();
  coursesSlider.addEventListener('mouseenter', stopCourseAutoplay);
  coursesSlider.addEventListener('mouseleave', startCourseAutoplay);
}

// ========================
// Mentors Slider
// ========================
let currentMentor = 0;
const mentorsSlider = document.getElementById('mentorsSlider');
let mentorInterval;

function getMentorMaxIndex() {
  if (!mentorsSlider) return 0;
  const items = mentorsSlider.querySelectorAll('.mentors-item');
  const visibleCount = window.innerWidth > 991 ? 4 : (window.innerWidth > 767 ? 2 : 1);
  return Math.max(0, items.length - visibleCount);
}

function handleMentorPrev() {
  if (!mentorsSlider) return;
  const maxIndex = getMentorMaxIndex();
  if (currentMentor <= 0) {
    currentMentor = maxIndex;
  } else {
    currentMentor = currentMentor - 1;
  }
  scrollMentorsTo(currentMentor);
}

function handleMentorNext() {
  if (!mentorsSlider) return;
  const maxIndex = getMentorMaxIndex();
  if (currentMentor >= maxIndex) {
    currentMentor = 0;
  } else {
    currentMentor = currentMentor + 1;
  }
  scrollMentorsTo(currentMentor);
}

document.getElementById('mentorPrev')?.addEventListener('click', () => {
  handleMentorPrev();
  resetMentorAutoScroll();
});

document.getElementById('mentorNext')?.addEventListener('click', () => {
  handleMentorNext();
  resetMentorAutoScroll();
});

function scrollMentorsTo(index) {
  if (!mentorsSlider) return;
  const itemEl = mentorsSlider.querySelector('.mentors-item');
  if (!itemEl) return;
  const itemWidth = itemEl.offsetWidth + 24; // width + gap
  mentorsSlider.scrollTo({
    left: index * itemWidth,
    behavior: 'smooth'
  });
}

function startMentorAutoScroll() {
  mentorInterval = setInterval(() => {
    handleMentorNext();
  }, 3000);
}

function resetMentorAutoScroll() {
  clearInterval(mentorInterval);
  startMentorAutoScroll();
}

// Start auto scroll on page load
startMentorAutoScroll();

// Pause auto scroll when user hovers over the slider
mentorsSlider?.addEventListener('mouseenter', () => clearInterval(mentorInterval));
mentorsSlider?.addEventListener('mouseleave', startMentorAutoScroll);

// ========================
// FAQ Accordion
// ========================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  question?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all others
    faqItems.forEach(fi => fi.classList.remove('open'));
    // Toggle current
    if (!isOpen) item.classList.add('open');
  });
});

// ========================
// Scroll Animations (Intersection Observer)
// ========================
const animatedEls = document.querySelectorAll('.fade-in-up');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -30px 0px'
});

animatedEls.forEach(el => observer.observe(el));

// ========================
// Form submission and Validation
// ========================
function validateForm(form) {
  let isValid = true;
  
  // Clear previous errors
  form.querySelectorAll('.error-msg').forEach(el => el.remove());
  form.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));

  // 1. Validate Name
  const nameInput = form.querySelector('input[name="name"]');
  if (nameInput) {
    const val = nameInput.value.trim();
    if (val === '') {
      showFieldError(nameInput, 'Name is required');
      isValid = false;
    } else if (val.length < 3) {
      showFieldError(nameInput, 'Name must be at least 3 characters');
      isValid = false;
    }
  }

  // 2. Validate Phone
  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput) {
    const val = phoneInput.value.replace(/[^0-9]/g, '');
    if (val === '') {
      showFieldError(phoneInput, 'Phone number is required');
      isValid = false;
    } else if (val.length !== 10) {
      showFieldError(phoneInput, 'Phone number must be exactly 10 digits');
      isValid = false;
    } else if (!/^[6789]/.test(val)) {
      showFieldError(phoneInput, 'Phone number must start with 6, 7, 8, or 9');
      isValid = false;
    }
  }

  // 3. Validate Email
  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput) {
    const val = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val === '') {
      showFieldError(emailInput, 'Email ID is required');
      isValid = false;
    } else if (!emailRegex.test(val)) {
      showFieldError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }
  }

  // 4. Validate State
  const stateInput = form.querySelector('input[name="state"]');
  if (stateInput) {
    const val = stateInput.value.trim();
    if (val === '') {
      const dropdownTrigger = stateInput.closest('.custom-dropdown')?.querySelector('.dropdown-trigger');
      showFieldError(dropdownTrigger || stateInput, 'State is required');
      isValid = false;
    }
  }

  // 4.5. Validate City
  const cityInput = form.querySelector('input[name="city"]');
  if (cityInput) {
    const val = cityInput.value.trim();
    if (val === '') {
      showFieldError(cityInput, 'City is required');
      isValid = false;
    }
  }

  // 5. Validate Program (course)
  const programInput = form.querySelector('input[name="course"]');
  if (programInput) {
    const val = programInput.value.trim();
    if (val === '') {
      const dropdownTrigger = programInput.closest('.custom-dropdown')?.querySelector('.dropdown-trigger');
      showFieldError(dropdownTrigger || programInput, 'Please select a program');
      isValid = false;
    }
  }

  // 6. Validate Consent Checkbox
  const consentInput = form.querySelector('input[name="consent"]');
  if (consentInput && !consentInput.checked) {
    showFieldError(consentInput, 'Please authorize to proceed');
    isValid = false;
  }

  return isValid;
}

function showFieldError(inputEl, message) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  
  const err = document.createElement('div');
  err.className = 'error-msg';
  err.style.color = '#e11d48';
  err.style.fontSize = '0.78rem';
  err.style.fontWeight = '600';
  err.style.marginTop = '4px';
  err.style.textAlign = 'left';
  err.textContent = message;
  group.appendChild(err);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  if (!validateForm(form)) {
    return;
  }

  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Submitting...';
  btn.disabled = true;

  // Gather values
  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const stateInput = form.querySelector('input[name="state"]');
  const cityInput = form.querySelector('input[name="city"]');
  const courseInput = form.querySelector('input[name="course"]');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const emailVal = emailInput ? emailInput.value.trim() : '';
  let phoneVal = phoneInput ? phoneInput.value.trim() : '';
  const stateVal = stateInput ? stateInput.value.trim() : '';
  const cityVal = cityInput ? cityInput.value.trim() : '';
  const courseVal = courseInput ? courseInput.value.trim() : '';

  // Format phone number to start with +91 if it's 10 digits
  if (phoneVal.length === 10 && !phoneVal.startsWith('+')) {
    phoneVal = '+91' + phoneVal;
  }

  // Get campaign source and UTM parameters from URL parameters or session storage
  const urlParams = new URLSearchParams(window.location.search);
  
  function getUtmParam(paramName) {
    let val = urlParams.get(paramName);
    if (!val) {
      try {
        val = sessionStorage.getItem(paramName) || '';
      } catch (e) {
        val = '';
      }
    }
    return val;
  }

  // Wait for IP to finish fetching if it hasn't already (up to 1.5 seconds)
  if (!userIpAddress && typeof ipPromise !== 'undefined' && ipPromise) {
    try {
      userIpAddress = await Promise.race([
        ipPromise,
        new Promise(resolve => setTimeout(() => resolve(''), 1500))
      ]) || '';
    } catch (e) {
      console.warn('IP fetch timed out or failed:', e);
    }
  }

  // Get campaign source and UTM parameters with dynamic referrer details and defaults
  let utmSourceVal = getUtmParam('utm_source');
  let utmMediumVal = getUtmParam('utm_medium');
  
  if (!utmSourceVal) {
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.hostname.includes('google.')) {
          utmSourceVal = 'Google';
          utmMediumVal = utmMediumVal || 'Organic';
        } else if (refUrl.hostname.includes('bing.')) {
          utmSourceVal = 'Bing';
          utmMediumVal = utmMediumVal || 'Organic';
        } else if (refUrl.hostname.includes('yahoo.')) {
          utmSourceVal = 'Yahoo';
          utmMediumVal = utmMediumVal || 'Organic';
        } else {
          utmSourceVal = refUrl.hostname || 'Referral';
          utmMediumVal = utmMediumVal || 'Referral';
        }
      } catch (e) {
        utmSourceVal = 'Referral';
        utmMediumVal = utmMediumVal || 'Referral';
      }
    } else {
      utmSourceVal = 'Direct';
      utmMediumVal = utmMediumVal || 'Direct';
    }
  } else if (!utmMediumVal) {
    utmMediumVal = 'Direct';
  }

  const utmCampaignVal = getUtmParam('utm_campaign') || getUtmParam('campaign_id') || getUtmParam('campaign') || utmSourceVal;
  const utmTermVal = getUtmParam('utm_term') || '';
  const utmContentVal = getUtmParam('utm_content') || '';
  const sourceCampaignVal = utmCampaignVal;
  const utmKeywordVal = getUtmParam('utm_keyword') || getUtmParam('keyword') || utmTermVal;
  const utmLocationVal = getUtmParam('utm_location') || getUtmParam('location') || getUtmParam('loc_physical_ms') || '';
  const gclidVal = getUtmParam('gclid') || '';

  // Construct payload matching LeadSquared template
  const payload = [
    {
      "Attribute": "FirstName",
      "Value": nameVal
    },
    {
      "Attribute": "EmailAddress",
      "Value": emailVal
    },
    {
      "Attribute": "Phone",
      "Value": phoneVal
    },
    {
      "Attribute": "mx_State",
      "Value": stateVal
    },
    {
      "Attribute": "mx_City",
      "Value": cityVal
    },
    {
      "Attribute": "mx_Course",
      "Value": courseVal
    },
    {
      "Attribute": "mx_University",
      "Value": "Manipal"
    },
    {
      "Attribute": "mx_UTM_Keyword",
      "Value": utmKeywordVal
    },
    {
      "Attribute": "mx_UTM_Location",
      "Value": utmLocationVal
    },
    {
      "Attribute": "Source",
      "Value": utmSourceVal
    },
    {
      "Attribute": "SourceCampaign",
      "Value": sourceCampaignVal
    },
    {
      "Attribute": "SourceContent",
      "Value": utmContentVal
    },
    {
      "Attribute": "SourceMedium",
      "Value": utmMediumVal
    },
    {
      "Attribute": "mx_SourceIPAddress",
      "Value": userIpAddress
    },
    {
      "Attribute": "mx_GCLID",
      "Value": gclidVal
    }
  ];


  const apiUrl = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=u$r3040ef6ef283391cca5c19f26c3649eb&secretKey=69aedb87702c8a1f0781c891f02ead4228a924fc';

  console.log('LeadSquared API Payload:', JSON.stringify(payload, null, 2));

  // Prepare Google Sheet Webhook request (in parallel)
  let googleSheetPromise = Promise.resolve(null);
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_SHEET_WEB_APP_URL') {
    const sheetPayload = new URLSearchParams();
    sheetPayload.append('name', nameVal);
    sheetPayload.append('email', emailVal);
    sheetPayload.append('phone', phoneVal);
    sheetPayload.append('state', stateVal);
    sheetPayload.append('city', cityVal);
    sheetPayload.append('course', courseVal);
    sheetPayload.append('utm_source', utmSourceVal);
    sheetPayload.append('utm_medium', utmMediumVal);
    sheetPayload.append('utm_campaign', utmCampaignVal);
    sheetPayload.append('utm_term', utmTermVal);
    sheetPayload.append('utm_content', utmContentVal);
    sheetPayload.append('utm_keyword', utmKeywordVal);
    sheetPayload.append('utm_location', utmLocationVal);
    sheetPayload.append('university', 'Manipal');
    sheetPayload.append('ip', userIpAddress);

    googleSheetPromise = fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', // Avoids CORS errors during redirection
      body: sheetPayload
    }).catch(err => {
      console.error('Google Sheet submission error (handled gracefully):', err);
    });
  }

  try {
    // Send requests to both endpoints simultaneously
    const [response] = await Promise.all([
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }),
      googleSheetPromise
    ]);

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON
      }
    }

    if (!response.ok) {
      const errorMsg = (responseData && responseData.ExceptionMessage) || `Server returned status: ${response.status}`;
      throw new Error(errorMsg);
    }

    // LeadSquared may return a 200 OK with Status: "Error" or containing an ExceptionMessage inside the JSON response
    if (responseData && (responseData.Status === "Error" || responseData.ExceptionMessage)) {
      const err = new Error(responseData.ExceptionMessage || "Submission error occurred");
      err.exceptionType = responseData.ExceptionType;
      err.isMXException = responseData.IsMXException;
      throw err;
    }

      // Store user data in sessionStorage for thankyou.html customization
      try {
        sessionStorage.setItem('lead_name', nameVal);
        sessionStorage.setItem('lead_course', courseVal);
        sessionStorage.setItem('lead_phone', phoneVal);
        sessionStorage.setItem('lead_email', emailVal);
      } catch (e) {
        console.warn('Could not store lead data in sessionStorage:', e);
      }

      // Success response handling
      btn.textContent = '✓ Application Submitted!';
      btn.style.background = '#10b981';
      form.reset();
  
      // Clear residual error states
      form.querySelectorAll('.error-msg').forEach(el => el.remove());
      form.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
  
      // Trigger Google Tag conversion tracking and redirect
      if (typeof window.gtag_report_conversion === 'function') {
        window.gtag_report_conversion('thankyou.html');
        // Set fallback redirect timeout of 1.5 seconds in case Google tracking fails or is blocked
        setTimeout(() => {
          window.location.href = 'thankyou.html';
        }, 1500);
      } else {
        window.location.href = 'thankyou.html';
      }
  
    } catch (error) {
      console.error('LeadSquared Capture Error:', error);

      // Hide loading overlay on failure
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
      }

      // Show error message and restore button
      btn.textContent = 'Submission Failed. Retry';
      btn.style.background = '#e11d48';
      btn.disabled = false;
  
      // Show toast for the specific error
      showToast(error.message || 'There was a submission error. Please try again.', 'error', 'Submission Failed');
  
      // Show dynamic error notification to user under button
      let errorContainer = form.querySelector('.submit-error-msg');
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'submit-error-msg error-msg';
        errorContainer.style.color = '#e11d48';
        errorContainer.style.fontSize = '0.85rem';
        errorContainer.style.fontWeight = '600';
        errorContainer.style.marginTop = '10px';
        errorContainer.style.textAlign = 'center';
        btn.parentNode.insertBefore(errorContainer, btn.nextSibling);
      }
      errorContainer.textContent = error.message || 'There was a submission error. Please check connection and try again.';
  
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        if (errorContainer) {
          errorContainer.remove();
        }
      }, 4000);
    }
}

// ========================
// Toast notification utility
// ========================
function showToast(message, type = 'error', title = '') {
  // Ensure container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Select icon based on type
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  else if (type === 'error') iconClass = 'fa-exclamation-circle';
  else if (type === 'warning') iconClass = 'fa-exclamation-triangle';

  if (!title) {
    if (type === 'success') title = 'Success';
    else if (type === 'error') title = 'Error';
    else if (type === 'warning') title = 'Warning';
    else title = 'Notification';
  }

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" aria-label="Close Toast">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Append to container
  container.appendChild(toast);

  // Trigger animation after append
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Setup click close event
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    dismissToast(toast);
  });

  // Auto dismiss after 5 seconds
  const timeoutId = setTimeout(() => {
    dismissToast(toast);
  }, 5000);

  // Store timeout on the element to cancel it if dismissed manually
  toast.dataset.timeoutId = timeoutId;
}

function dismissToast(toast) {
  if (toast.dataset.timeoutId) {
    clearTimeout(parseInt(toast.dataset.timeoutId));
  }
  toast.classList.remove('show');
  toast.addEventListener('transitionend', () => {
    toast.remove();
  });
}


// List of Indian States and Union Territories (9 Popular ones prioritized)
const INDIAN_STATES = [
  { name: 'Maharashtra', popular: true },
  { name: 'Delhi', popular: true },
  { name: 'Karnataka', popular: true },
  { name: 'Tamil Nadu', popular: true },
  { name: 'Uttar Pradesh', popular: true },
  { name: 'Telangana', popular: true },
  { name: 'Gujarat', popular: true },
  { name: 'Rajasthan', popular: true },
  { name: 'West Bengal', popular: true },
  
  { name: 'Andhra Pradesh', popular: false },
  { name: 'Arunachal Pradesh', popular: false },
  { name: 'Assam', popular: false },
  { name: 'Bihar', popular: false },
  { name: 'Chhattisgarh', popular: false },
  { name: 'Goa', popular: false },
  { name: 'Haryana', popular: false },
  { name: 'Himachal Pradesh', popular: false },
  { name: 'Jharkhand', popular: false },
  { name: 'Kerala', popular: false },
  { name: 'Madhya Pradesh', popular: false },
  { name: 'Manipur', popular: false },
  { name: 'Meghalaya', popular: false },
  { name: 'Mizoram', popular: false },
  { name: 'Nagaland', popular: false },
  { name: 'Odisha', popular: false },
  { name: 'Punjab', popular: false },
  { name: 'Sikkim', popular: false },
  { name: 'Tripura', popular: false },
  { name: 'Uttarakhand', popular: false },
  { name: 'Andaman and Nicobar Islands', popular: false },
  { name: 'Chandigarh', popular: false },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', popular: false },
  { name: 'Jammu and Kashmir', popular: false },
  { name: 'Ladakh', popular: false },
  { name: 'Lakshadweep', popular: false },
  { name: 'Puducherry', popular: false }
];

const PROGRAMS = [
  'BA',
  'BBA',
  'BCA',
  'MBA',
  'MA',
  'MCA'
];

function initCustomDropdowns() {
  const dropdowns = document.querySelectorAll('.custom-dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const searchInput = dropdown.querySelector('.dropdown-search');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const selectedValueSpan = dropdown.querySelector('.dropdown-selected-value');
    const type = dropdown.getAttribute('data-type');
    
    // 1. Populate the options
    if (type === 'state') {
      renderStateOptions(optionsContainer, INDIAN_STATES);
    } else if (type === 'program') {
      renderProgramOptions(optionsContainer, PROGRAMS);
    }

    // 2. Open/Close dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close all other dropdowns
      document.querySelectorAll('.custom-dropdown').forEach(other => {
        if (other !== dropdown) {
          other.classList.remove('open');
        }
      });
      
      const isOpen = dropdown.classList.toggle('open');
      if (isOpen && searchInput) {
        searchInput.value = '';
        filterStates('', optionsContainer);
        setTimeout(() => searchInput.focus(), 50);
      }
    });

    // 3. Selection handling
    optionsContainer.addEventListener('click', (e) => {
      const optionItem = e.target.closest('.option-item');
      if (!optionItem || optionItem.classList.contains('no-results')) return;
      
      const value = optionItem.getAttribute('data-value');
      
      // Update trigger visual state
      selectedValueSpan.textContent = value;
      trigger.classList.add('has-value');
      
      // Update hidden input
      hiddenInput.value = value;
      
      // Trigger native input/change events for validation/compatibility
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Update selected class
      optionsContainer.querySelectorAll('.option-item').forEach(item => {
        item.classList.toggle('selected', item === optionItem);
      });
      
      // Close dropdown
      dropdown.classList.remove('open');
      
      // Clear validation errors for this field if any
      const group = dropdown.closest('.form-group');
      if (group) {
        group.classList.remove('has-error');
        group.querySelectorAll('.error-msg').forEach(err => err.remove());
      }
    });

    // 4. Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        filterStates(query, optionsContainer);
      });
      
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid closing dropdown when clicking search input
      });
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  });
}

function renderStateOptions(container, states) {
  container.innerHTML = '';
  
  // Popular group
  const popularHeader = document.createElement('div');
  popularHeader.className = 'options-group-title popular-group-title';
  popularHeader.textContent = 'Popular States';
  container.appendChild(popularHeader);
  
  states.filter(s => s.popular).forEach(s => {
    const item = document.createElement('div');
    item.className = 'option-item popular-option';
    item.setAttribute('data-value', s.name);
    item.textContent = s.name;
    container.appendChild(item);
  });
  
  // Other group
  const otherHeader = document.createElement('div');
  otherHeader.className = 'options-group-title other-group-title';
  otherHeader.textContent = 'Other States / UTs';
  container.appendChild(otherHeader);
  
  states.filter(s => !s.popular).forEach(s => {
    const item = document.createElement('div');
    item.className = 'option-item other-option';
    item.setAttribute('data-value', s.name);
    item.textContent = s.name;
    container.appendChild(item);
  });
}

function renderProgramOptions(container, programs) {
  container.innerHTML = '';
  programs.forEach(p => {
    const item = document.createElement('div');
    item.className = 'option-item';
    item.setAttribute('data-value', p);
    item.textContent = p;
    container.appendChild(item);
  });
}

function filterStates(query, container) {
  const normQuery = query.toLowerCase().trim();
  const items = container.querySelectorAll('.option-item:not(.no-results)');
  const popularTitle = container.querySelector('.popular-group-title');
  const otherTitle = container.querySelector('.other-group-title');
  
  let visiblePopular = 0;
  let visibleOther = 0;
  
  items.forEach(item => {
    const val = item.getAttribute('data-value').toLowerCase();
    const matches = val.includes(normQuery);
    
    item.style.display = matches ? 'flex' : 'none';
    
    if (matches) {
      if (item.classList.contains('popular-option')) {
        visiblePopular++;
      } else {
        visibleOther++;
      }
    }
  });
  
  // Toggle group headers visibility
  if (popularTitle) {
    popularTitle.style.display = (visiblePopular > 0) ? 'block' : 'none';
  }
  if (otherTitle) {
    otherTitle.style.display = (visibleOther > 0) ? 'block' : 'none';
  }
  
  // Handle no results message
  let noResultsMsg = container.querySelector('.no-results');
  if (visiblePopular === 0 && visibleOther === 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'option-item no-results';
      noResultsMsg.textContent = 'No matching states found';
      container.appendChild(noResultsMsg);
    }
    noResultsMsg.style.display = 'flex';
  } else if (noResultsMsg) {
    noResultsMsg.style.display = 'none';
  }
}

// Initialize custom dropdowns
initCustomDropdowns();

// Set up form listeners
document.querySelectorAll('form').forEach(form => {
  const stateInput = form.querySelector('input[name="state"]');
  const cityInput = form.querySelector('input[name="city"]');
  
  if (stateInput && cityInput) {
    cityInput.disabled = true;
    cityInput.placeholder = "Select state first*";
    
    // Listen for state change (native dispatchEvent runs synchronously)
    stateInput.addEventListener('change', () => {
      if (stateInput.value.trim() !== '') {
        cityInput.disabled = false;
        cityInput.placeholder = "City*";
      } else {
        cityInput.disabled = true;
        cityInput.placeholder = "Select state first*";
        cityInput.value = '';
      }
    });
  }

  form.addEventListener('submit', handleFormSubmit);
  form.addEventListener('reset', () => {
    setTimeout(() => {
      form.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const type = dropdown.getAttribute('data-type');
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const selectedValueSpan = dropdown.querySelector('.dropdown-selected-value');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        
        trigger.classList.remove('has-value');
        if (type === 'state') {
          selectedValueSpan.innerHTML = 'Select State<span style="color: #ef4444; margin-left: 2px;">*</span>';
        } else if (type === 'program') {
          selectedValueSpan.innerHTML = 'Select Program<span style="color: #ef4444; margin-left: 2px;">*</span>';
        }
        hiddenInput.value = '';
        
        // Unselect options
        dropdown.querySelectorAll('.option-item').forEach(item => {
          item.classList.remove('selected');
        });
      });

      if (cityInput) {
        cityInput.disabled = true;
        cityInput.placeholder = "Select state first*";
        cityInput.value = '';
      }
    }, 0);
  });
});

// ========================
// Counter animation
// ========================
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 25);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => {
  statsObserver.observe(el);
});

// ========================
// Auto-open modal after 40s
// ========================
let modalShown = false;
setTimeout(() => {
  if (!modalShown) {
    modalShown = true;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}, 40000);

// ========================
// Phone number validation
// ========================
document.querySelectorAll('input[type="tel"]').forEach(input => {
  // Disallow non-numeric keys completely
  input.addEventListener('keypress', (e) => {
    if (e.key < '0' || e.key > '9') {
      e.preventDefault();
    }
  });

  // Filter input value in case of auto-fill or fallback
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
  });

  // Clean copy-pastes
  input.addEventListener('paste', (e) => {
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (/[^0-9]/.test(pasteData)) {
      e.preventDefault();
      const cleanData = pasteData.replace(/[^0-9]/g, '').slice(0, 10);
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.slice(0, start) + cleanData + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + cleanData.length;
    }
  });
});

// Testimonials auto-scroll (mobile)
const testimonialsSlider = document.querySelector('.testimonials-grid');
let testimonialIndex = 0;
let testimonialInterval;

function startTestimonialAutoScroll() {
  if (window.innerWidth <= 767 && testimonialsSlider) {
    testimonialInterval = setInterval(() => {
      const cards = testimonialsSlider.querySelectorAll('.testimonial-card');
      testimonialIndex = (testimonialIndex + 1) % cards.length;
      const cardWidth = cards[0]?.offsetWidth + 24;
      testimonialsSlider.scrollLeft = testimonialIndex * cardWidth;
    }, 3500);
  }
}

startTestimonialAutoScroll();
window.addEventListener('resize', () => {
  clearInterval(testimonialInterval);
  startTestimonialAutoScroll();
});

// ========================
// Cookie Consent Banner
// ========================
function initCookieConsent() {
  try {
    if (localStorage.getItem('cookie_consent')) {
      return; // Already responded
    }
    
    // Create banner element
    const banner = document.createElement('div');
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-header">
        <i class="fas fa-cookie-bite cookie-consent-icon"></i>
        <h4 class="cookie-consent-title">We Value Your Privacy</h4>
      </div>
      <p class="cookie-consent-text">
        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our <a href="privacy-policy.html">Privacy Policy</a> for more details.
      </p>
      <div class="cookie-consent-actions">
        <button class="cookie-consent-btn btn-decline" id="btnCookieDecline">Decline</button>
        <button class="cookie-consent-btn btn-accept" id="btnCookieAccept">Accept</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Slide up with delay
    setTimeout(() => {
      banner.classList.add('show');
    }, 1500);
    
    // Event listeners
    document.getElementById('btnCookieAccept')?.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'accepted');
      dismissBanner(banner);
    });
    
    document.getElementById('btnCookieDecline')?.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'declined');
      dismissBanner(banner);
    });
    
  } catch (e) {
    console.warn('Cookie consent block failed:', e);
  }
}

function dismissBanner(banner) {
  banner.classList.remove('show');
  banner.classList.add('hide');
  setTimeout(() => {
    banner.remove();
  }, 500);
}

// Initialize cookie consent
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  initCookieConsent();
}

// ========================
// Dynamic Phone Number Logic (Cycles 07303701705 and 09217378404 every 10 days)
// ========================
(function initDynamicPhone() {
  if (!window.activePhoneNumber) {
    var anchor = new Date(2026, 6, 17); // July 17, 2026 (local time)
    var today = new Date();
    var anchorUTC = Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    var todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    var diffDays = Math.floor((todayUTC - anchorUTC) / (1000 * 60 * 60 * 24));
    var cycleIndex = Math.floor(diffDays / 10);
    var normalizedCycle = ((cycleIndex % 2) + 2) % 2;
    window.activePhoneNumber = (normalizedCycle === 0) ? '09217378404 ' : '07303701705';
  }

  var activePhone = window.activePhoneNumber;

  // Update all anchor links with tel:
  var telLinks = document.querySelectorAll('a[href^="tel:"]');
  telLinks.forEach(function(link) {
    link.setAttribute('href', 'tel:' + activePhone);
  });

  // Update all text elements with call-number class
  var callNumberTexts = document.querySelectorAll('.call-number');
  callNumberTexts.forEach(function(el) {
    el.textContent = activePhone;
  });
})();

// ========================
// Dynamic Application Deadline Calculation
// Adds 2 working days (Friday -> Monday, Saturday -> Tuesday, Sunday -> Tuesday)
// ========================
(function initApplicationDeadline() {
  function calculateDeadlineDate() {
    const today = new Date();
    const currentDay = today.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    let daysToAdd = 2;

    if (currentDay === 5) {
      // Friday -> Saturday -> skip Sunday -> Monday (+3 days)
      daysToAdd = 3;
    } else if (currentDay === 6) {
      // Saturday -> skip Sunday -> Monday -> Tuesday (+3 days)
      daysToAdd = 3;
    } else if (currentDay === 0) {
      // Sunday -> Monday -> Tuesday (+2 days)
      daysToAdd = 2;
    } else {
      // Mon - Thu (+2 days)
      daysToAdd = 2;
    }

    const deadlineDate = new Date(today);
    deadlineDate.setDate(today.getDate() + daysToAdd);

    const dayNum = deadlineDate.getDate();
    const getOrdinal = function(n) {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthStr = months[deadlineDate.getMonth()];
    const yearStr = "'" + String(deadlineDate.getFullYear()).slice(-2);

    return getOrdinal(dayNum) + " " + monthStr + " " + yearStr;
  }

  function updateDeadlineElements() {
    const deadlineText = calculateDeadlineDate();
    const deadlineElements = document.querySelectorAll('.application-deadline-date, #applicationDeadline');
    deadlineElements.forEach(function(el) {
      el.textContent = deadlineText;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDeadlineElements);
  } else {
    updateDeadlineElements();
  }
})();


