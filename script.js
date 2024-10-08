document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cv-form');
    const sections = Array.from(form.getElementsByClassName('form-section'));
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const submitButton = document.getElementById('submit');
    const stepIndicators = Array.from(document.getElementsByClassName('step'));
    const cvPreviewContainer = document.getElementById('cv-preview-container');
    let currentSection = 0;

    // Variables to store selected color and layout
    let selectedColor = '#3498db'; // Default color
    let selectedLayout = 'classic'; // Default layout

    // Function to handle color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(button => {
        button.addEventListener('click', () => {
            colorOptions.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedColor = button.getAttribute('data-color');
            console.log("Selected color:", selectedColor);
        });
    });

    // Function to handle layout selection
    const layoutOptions = document.querySelectorAll('.layout-option');
    layoutOptions.forEach(button => {
        button.addEventListener('click', () => {
            layoutOptions.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedLayout = button.getAttribute('data-layout');
            console.log("Selected layout:", selectedLayout);
        });
    });

    function showSection(index) {
        sections.forEach((section, i) => {
            section.style.display = i === index ? 'block' : 'none';
        });
        stepIndicators.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        prevButton.disabled = index === 0;
        nextButton.style.display = index === sections.length - 2 ? 'none' : 'inline';
        submitButton.style.display = index === sections.length - 2 ? 'inline' : 'none';
    }

    prevButton.addEventListener('click', () => {
        if (currentSection > 0) {
            currentSection--;
            showSection(currentSection);
        }
    });

    nextButton.addEventListener('click', () => {
        if (validateSection(sections[currentSection])) {
            if (currentSection < sections.length - 1) {
                currentSection++;
                showSection(currentSection);
            }
        } else {
            alert('Please fill in all required fields before proceeding.');
        }
    });

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateAllSections()) {
            currentSection = sections.length - 1;
            showSection(currentSection);
            showLoading();
            setTimeout(() => {
                generateCV();
                hideLoading();
            }, 2000); // Changed to 2 seconds
        } else {
            alert('Please fill in all required fields before generating your CV.');
        }
    });

    function showLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
        cvPreviewContainer.innerHTML = ''; // Clear any existing content
    }

    function hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    function getAllFormData() {
        const formData = new FormData(form);
        const data = {};

        const safeTrim = value => (typeof value === 'string' ? value.trim() : value);

        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const arrayKey = key.slice(0, -2);
                if (!data[arrayKey]) data[arrayKey] = [];
                data[arrayKey].push(safeTrim(value));
            } else {
                data[key] = safeTrim(value);
            }
        }

        // Process specific fields that require splitting or special handling
        data.skills = document.getElementById('skills').value.trim() ? document.getElementById('skills').value.split(',').map(skill => skill.trim()).filter(Boolean) : [];
        data.projects = document.getElementById('projects').value.trim() ? document.getElementById('projects').value.split(',').map(project => project.trim()).filter(Boolean) : [];
        data.certifications = document.getElementById('certifications').value.trim() ? document.getElementById('certifications').value.split(',').map(cert => cert.trim()).filter(Boolean) : [];
        data.languages = document.getElementById('languages').value.trim() ? document.getElementById('languages').value.split(',').map(language => language.trim()).filter(Boolean) : [];

        data.workExperience = processWorkExperience();
        data.education = processEducation();
        data.volunteer = document.getElementById('volunteer').value.trim();
        data.references = document.getElementById('references').value.trim();

        data.colorScheme = selectedColor;
        data.layout = selectedLayout;

        console.log("Final gathered form data:", data);
        return data;
    }

    function processWorkExperience() {
        const workExperience = [];
        const companies = form.querySelectorAll('input[name="company[]"]');
        const jobs = form.querySelectorAll('input[name="job[]"]');
        const durations = form.querySelectorAll('input[name="duration[]"]');

        for (let i = 0; i < companies.length; i++) {
            if (companies[i].value.trim() || jobs[i].value.trim() || durations[i].value.trim()) {
                workExperience.push({
                    company: companies[i].value.trim(),
                    job: jobs[i].value.trim(),
                    duration: durations[i].value.trim()
                });
            }
        }
        return workExperience;
    }

    function processEducation() {
        const education = [];
        const institutions = form.querySelectorAll('input[name="institution[]"]');
        const degrees = form.querySelectorAll('input[name="degree[]"]');
        const graduationYears = form.querySelectorAll('input[name="graduationYear[]"]');

        for (let i = 0; i < institutions.length; i++) {
            if (institutions[i].value.trim() || degrees[i].value.trim() || graduationYears[i].value.trim()) {
                education.push({
                    institution: institutions[i].value.trim(),
                    degree: degrees[i].value.trim(),
                    graduationYear: graduationYears[i].value.trim()
                });
            }
        }
        return education;
    }

    function generateCV() {
        try {
            console.log("Generating CV...");
            const data = getAllFormData();
            let layout;
            switch (data.layout) {
                case 'classic':
                    layout = generateClassicLayout(data);
                    break;
                case 'modern':
                    layout = generateModernLayout(data);
                    break;
                default:
                    layout = generateClassicLayout(data);
            }
            cvPreviewContainer.innerHTML = layout;
            applyColorScheme(data);
        } catch (error) {
            console.error("Error generating CV:", error);
            alert("An error occurred while generating your CV. Please try again.");
        }
    }

    function applyColorScheme(data) {
        const cvLayout = cvPreviewContainer.querySelector('.cv-layout');
        if (cvLayout) {
            const colorScheme = data.colorScheme || '#3498db';
            cvLayout.style.setProperty('--primary-color', colorScheme);
            const header = cvLayout.querySelector('.cv-header');
            if (header) {
                header.style.backgroundColor = colorScheme;
            }
        }
    }

    function getProfilePicture() {
        const profilePictureInput = document.getElementById('profilePicture');
        return profilePictureInput.files.length > 0 ? URL.createObjectURL(profilePictureInput.files[0]) : '';
    }

    function generateClassicLayout(data) {
        const profilePicture = getProfilePicture();
        return `
            <div class="cv-layout classic">
                <div class="cv-header">
                    ${profilePicture ? `<img src="${profilePicture}" class="profile-picture" alt="Profile Picture">` : ''}
                    <h1>${data.fullName || ''}</h1>
                    <div class="contact-info">
                        <div class="contact-line">
                            ${data.email ? `<a href="mailto:${data.email}" style="color: white;"><i class="fas fa-envelope"></i> ${data.email}</a>` : ''}
                            ${data.phone ? `<a href="tel:${data.phone}" style="color: white;"><i class="fas fa-phone"></i> ${data.phone}</a>` : ''}
                            ${data.website ? `<a href="${data.website}" target="_blank" style="color: white;"><i class="fas fa-globe"></i> Website</a>` : ''}
                        </div>
                        <div class="contact-line">
                            ${data.github ? `<a href="${data.github}" target="_blank" style="color: white;"><i class="fab fa-github"></i> GitHub</a>` : ''}
                            ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" style="color: white;"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="cv-body">
                    ${data.summary ? `<section><h2>Summary</h2><p>${data.summary}</p></section>` : ''}
                    ${generateWorkExperience(data)}
                    ${generateEducation(data)}
                    ${generateSkills(data)}
                    ${generateAdditionalSections(data)}
                </div>
            </div>
        `;
    }

    function generateModernLayout(data) {
        const profilePicture = getProfilePicture();
        return `
            <div class="cv-layout modern">
                <div class="cv-header">
                    ${profilePicture ? `<img src="${profilePicture}" class="profile-picture" alt="Profile Picture">` : ''}
                    <h1>${data.fullName || ''}</h1>
                    <div class="contact-info">
                        <div class="contact-line">
                            ${data.email ? `<a href="mailto:${data.email}" style="color: white;"><i class="fas fa-envelope"></i> ${data.email}</a>` : ''}
                            ${data.phone ? `<a href="tel:${data.phone}" style="color: white;"><i class="fas fa-phone"></i> ${data.phone}</a>` : ''}
                            ${data.website ? `<a href="${data.website}" target="_blank" style="color: white;"><i class="fas fa-globe"></i> Website</a>` : ''}
                        </div>
                        <div class="contact-line">
                            ${data.github ? `<a href="${data.github}" target="_blank" style="color: white;"><i class="fab fa-github"></i> GitHub</a>` : ''}
                            ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" style="color: white;"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="cv-body">
                    ${data.summary ? `<section><h2>Summary</h2><p>${data.summary}</p></section>` : ''}
                    ${generateWorkExperience(data)}
                    ${generateEducation(data)}
                    ${generateSkills(data)}
                    ${generateAdditionalSections(data)}
                </div>
            </div>
        `;
    }

    function generateWorkExperience(data) {
        if (!data.workExperience || data.workExperience.length === 0) return '';
        return `
            <section>
                <h2>Work Experience</h2>
                <ul>
                    ${data.workExperience.map(experience => 
                        `<li><strong>${experience.job}</strong> at <em>${experience.company}</em> ${experience.duration ? `(${experience.duration})` : ''}</li>`
                    ).join('')}
                </ul>
            </section>
        `;
    }

    function generateEducation(data) {
        if (!data.education || data.education.length === 0) return '';
        return `
            <section>
                <h2>Education</h2>
                <ul>
                    ${data.education.map(edu => 
                        `<li><strong>${edu.degree}</strong> from <em>${edu.institution}</em> ${edu.graduationYear ? `(${edu.graduationYear})` : ''}</li>`
                    ).join('')}
                </ul>
            </section>
        `;
    }

    function generateSkills(data) {
        if (!data.skills || data.skills.length === 0) return '';
        return `
            <section>
                <h2>Skills</h2>
                <ul>${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
            </section>
        `;
    }

    function generateAdditionalSections(data) {
        return `
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                ${data.projects && data.projects.length > 0 ? `
                    <section style="flex: 1; min-width: 300px; margin-right: 20px;">
                        <h2>Projects</h2>
                        <ul>${data.projects.map(project => `<li>${project}</li>`).join('')}</ul>
                    </section>
                ` : ''}
                ${data.certifications && data.certifications.length > 0 ? `
                    <section style="flex: 1; min-width: 300px;">
                        <h2>Certifications</h2>
                        <ul>${data.certifications.map(cert => `<li>${cert}</li>`).join('')}</ul>
                    </section>
                ` : ''}
                ${data.languages && data.languages.length > 0 ? `
                    <section style="flex: 1; min-width: 300px;">
                        <h2>Languages</h2>
                        <ul>${data.languages.map(language => `<li>${language}</li>`).join('')}</ul>
                    </section>
                ` : ''}
            </div>
            ${data.volunteer ? `
                <section>
                    <h2>Volunteer Experience</h2>
                    <p>${data.volunteer}</p>
                </section>
            ` : ''}
            ${data.references ? `
                <section>
                    <h2>References</h2>
                    <p>${data.references}</p>
                </section>
            ` : ''}
        `.trim();
    }

    function validateSection(section) {
        const requiredInputs = section.querySelectorAll('input[required], textarea[required]');
        return Array.from(requiredInputs).every(input => input.value.trim() !== '');
    }

    function validateAllSections() {
        return sections.slice(0, -1).every(validateSection);
    }

    document.getElementById('edit-cv').addEventListener('click', () => {
        currentSection = 0;
        showSection(currentSection);
    });

    // Improved PDF Generation and Download Functionality
    document.getElementById('download-pdf').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const element = document.querySelector('.cv-layout');
        
        // Show a loading indicator
        showLoading();

        const opt = {
            margin:       [10, 10, 10, 10], // top, left, bottom, right
            filename:     'my_cv.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                logging: false,
                scrollY: 0, // Ensures the page starts at the top
                windowWidth: document.documentElement.scrollWidth, // Helps with wider layouts
                windowHeight: document.documentElement.scrollHeight
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['css', 'avoid-all']} // Ensures CSS page breaks are respected
        };

        // Apply additional CSS for PDF rendering
        const pdfStyles = document.createElement('style');
        pdfStyles.innerHTML = `
            @media print {
                /* Ensure the CV layout takes full width */
                .cv-layout {
                    width: 100%;
                    box-sizing: border-box;
                }
                
                /* Adjust sections to fit within PDF pages */
                section {
                    page-break-inside: avoid;
                }

                /* Optional: Customize fonts and sizes for PDF */
                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }

                h1, h2, h3 {
                    page-break-after: avoid;
                }

                /* Remove any flex layout for PDF to prevent alignment issues */
                .cv-body, .contact-info, .contact-line, .cv-header {
                    display: block !important;
                }

                /* Adjust padding and margins */
                .cv-header, .cv-body {
                    padding: 10mm;
                }

                .profile-picture {
                    max-width: 100px;
                    height: auto;
                    display: block;
                    margin-bottom: 10px;
                }
            }
        `;
        document.head.appendChild(pdfStyles);

        html2pdf().set(opt).from(element).save().then(() => {
            hideLoading();
            // Remove the injected PDF styles after generation
            document.head.removeChild(pdfStyles);
        }).catch((error) => {
            console.error("Error generating PDF:", error);
            hideLoading();
            alert("Failed to generate PDF. Please try again.");
            // Remove the injected PDF styles in case of an error
            document.head.removeChild(pdfStyles);
        });
    });

    document.getElementById('download-image').addEventListener('click', () => {
        const element = cvPreviewContainer.querySelector('.cv-layout');
        
        // Set up options for html2canvas
        const options = {
            scale: 2,
            useCORS: true,
            logging: false,
            width: element.offsetWidth,
            height: element.scrollHeight
        };

        // Use html2canvas to create an image
        html2canvas(element, options).then(canvas => {
            // Convert canvas to blob
            canvas.toBlob(blob => {
                // Create a download link and trigger the download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'my_cv.png';
                link.click();
                
                // Clean up
                URL.revokeObjectURL(url);
            }, 'image/png');
        });
    });

    // Work experience functionality
    const addWorkExperienceButton = document.getElementById('addWorkExperience');
    const workExperienceEntries = document.getElementById('workExperienceEntries');
    let workExperienceCount = 0;

    addWorkExperienceButton.addEventListener('click', () => {
        if (workExperienceCount < 4) {
            addWorkExperienceEntry();
        }
        if (workExperienceCount === 4) {
            addWorkExperienceButton.disabled = true;
        }
    });

    function addWorkExperienceEntry() {
        workExperienceCount++;
        const entryId = `workExperience${workExperienceCount}`;
        const entry = document.createElement('div');
        entry.className = 'work-experience-entry';
        entry.innerHTML = `
            <h3>Company ${workExperienceCount}</h3>
            <input type="text" id="${entryId}Company" name="company[]" placeholder="Company" required>
            <input type="text" id="${entryId}Job" name="job[]" placeholder="Job Title" required>
            <input type="text" id="${entryId}Duration" name="duration[]" placeholder="Duration" required>
            <button type="button" class="removeWorkExperience">Remove</button>
        `;
        workExperienceEntries.appendChild(entry);

        entry.querySelector('.removeWorkExperience').addEventListener('click', () => {
            workExperienceEntries.removeChild(entry);
            workExperienceCount--;
            addWorkExperienceButton.disabled = false;
        });
    }

    // Education functionality
    const addEducationButton = document.getElementById('addEducation');
    const educationEntries = document.getElementById('educationEntries');
    let educationCount = 0;

    addEducationButton.addEventListener('click', () => {
        if (educationCount < 4) {
            addEducationEntry();
        }
        if (educationCount === 4) {
            addEducationButton.disabled = true;
        }
    });

    function addEducationEntry() {
        educationCount++;
        const entryId = `education${educationCount}`;
        const entry = document.createElement('div');
        entry.className = 'education-entry';
        entry.innerHTML = `
            <h3>Education ${educationCount}</h3>
            <input type="text" id="${entryId}Institution" name="institution[]" placeholder="Institution" required>
            <input type="text" id="${entryId}Degree" name="degree[]" placeholder="Degree" required>
            <input type="text" id="${entryId}GraduationYear" name="graduationYear[]" placeholder="Graduation Year" required>
            <button type="button" class="removeEducation">Remove</button>
        `;
        educationEntries.appendChild(entry);

        entry.querySelector('.removeEducation').addEventListener('click', () => {
            educationEntries.removeChild(entry);
            educationCount--;
            addEducationButton.disabled = false;
        });
    }

    // Ensure that a default selection is set for color and layout
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('selected');
    }
    if (layoutOptions.length > 0) {
        layoutOptions[0].classList.add('selected');
    }

    showSection(currentSection);
});

    document.getElementById('edit-cv').addEventListener('click', () => {
        currentSection = 0;
        showSection(currentSection);
    });

    // Fixed PDF Generation and Download Functionality
    document.getElementById('download-pdf').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const element = document.querySelector('.cv-layout');
        
        // Show a loading indicator
        showLoading();

        const opt = {
            margin:       10,
            filename:     'my_cv.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            hideLoading();
        }).catch((error) => {
            console.error("Error generating PDF:", error);
            hideLoading();
            alert("Failed to generate PDF. Please try again.");
        });
    });

    document.getElementById('download-image').addEventListener('click', () => {
        const element = cvPreviewContainer.querySelector('.cv-layout');
        
        // Set up options for html2canvas
        const options = {
            scale: 2,
            useCORS: true,
            logging: false,
            width: element.offsetWidth,
            height: element.scrollHeight
        };

        // Use html2canvas to create an image
        html2canvas(element, options).then(canvas => {
            // Convert canvas to blob
            canvas.toBlob(blob => {
                // Create a download link and trigger the download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'my_cv.png';
                link.click();
                
                // Clean up
                URL.revokeObjectURL(url);
            }, 'image/png');
        });
    });

    // Work experience functionality
    const addWorkExperienceButton = document.getElementById('addWorkExperience');
    const workExperienceEntries = document.getElementById('workExperienceEntries');
    let workExperienceCount = 0;

    addWorkExperienceButton.addEventListener('click', () => {
        if (workExperienceCount < 4) {
            addWorkExperienceEntry();
        }
        if (workExperienceCount === 4) {
            addWorkExperienceButton.disabled = true;
        }
    });

    function addWorkExperienceEntry() {
        workExperienceCount++;
        const entryId = `workExperience${workExperienceCount}`;
        const entry = document.createElement('div');
        entry.className = 'work-experience-entry';
        entry.innerHTML = `
            <h3>Company ${workExperienceCount}</h3>
            <input type="text" id="${entryId}Company" name="company[]" placeholder="Company" required>
            <input type="text" id="${entryId}Job" name="job[]" placeholder="Job Title" required>
            <input type="text" id="${entryId}Duration" name="duration[]" placeholder="Duration" required>
            <button type="button" class="removeWorkExperience">Remove</button>
        `;
        workExperienceEntries.appendChild(entry);

        entry.querySelector('.removeWorkExperience').addEventListener('click', () => {
            workExperienceEntries.removeChild(entry);
            workExperienceCount--;
            addWorkExperienceButton.disabled = false;
        });
    }

    // Education functionality
    const addEducationButton = document.getElementById('addEducation');
    const educationEntries = document.getElementById('educationEntries');
    let educationCount = 0;

    addEducationButton.addEventListener('click', () => {
        if (educationCount < 4) {
            addEducationEntry();
        }
        if (educationCount === 4) {
            addEducationButton.disabled = true;
        }
    });

    function addEducationEntry() {
        educationCount++;
        const entryId = `education${educationCount}`;
        const entry = document.createElement('div');
        entry.className = 'education-entry';
        entry.innerHTML = `
            <h3>Education ${educationCount}</h3>
            <input type="text" id="${entryId}Institution" name="institution[]" placeholder="Institution" required>
            <input type="text" id="${entryId}Degree" name="degree[]" placeholder="Degree" required>
            <input type="text" id="${entryId}GraduationYear" name="graduationYear[]" placeholder="Graduation Year" required>
            <button type="button" class="removeEducation">Remove</button>
        `;
        educationEntries.appendChild(entry);

        entry.querySelector('.removeEducation').addEventListener('click', () => {
            educationEntries.removeChild(entry);
            educationCount--;
            addEducationButton.disabled = false;
        });
    }

    // Ensure that a default selection is set for color and layout
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('selected');
    }
    if (layoutOptions.length > 0) {
        layoutOptions[0].classList.add('selected');
    }

    showSection(currentSection);

