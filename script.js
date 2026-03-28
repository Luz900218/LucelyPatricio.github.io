document.getElementById('hamburger').onclick = function() {
    document.getElementById('navLinks').classList.toggle('active');
};
document.querySelectorAll('#navLinks a').forEach(function(a) {
    a.onclick = function() { document.getElementById('navLinks').classList.remove('active'); };
});

var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
function observeAll() {
    document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });
}
observeAll();

function getImages(p) {
    if (!p.image) return [];
    if (typeof p.image === 'string') return p.image.trim() !== '' ? [p.image] : [];
    if (Array.isArray(p.image)) return p.image.filter(function(i) { return i && i.trim() !== ''; });
    return [];
}

var ROLES = {};

// ─── Security: sanitize strings from JSON to prevent XSS ───
function sanitize(str) {
    if (typeof str !== 'string') return str;
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Sanitize URL - only allow http, https and # links
function sanitizeUrl(url) {
    if (typeof url !== 'string') return '#';
    url = url.trim();
    if (url.charAt(0) === '#') return url;
    if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) return url;
    return '#';
}

fetch('config.json')
    .then(function(r) {
        if (!r.ok) throw new Error('Could not load config.json (HTTP ' + r.status + ')');
        return r.json();
    })
    .then(function(cfg) {
        // Validate minimum required sections
        var missing = [];
        if (!cfg.roles) missing.push('roles');
        if (!cfg.hero) missing.push('hero');
        if (!cfg.projects) missing.push('projects');
        if (!cfg.skills) missing.push('skills');

        if (missing.length > 0) {
            showError('config.json is missing required sections: ' + missing.join(', '));
            return;
        }

        ROLES = cfg.roles || {};
        renderHero(cfg.hero, cfg.projects.length);
        document.getElementById('aboutText').textContent = cfg.about || '';
        renderTabs(cfg.projects);
        renderCards(cfg.projects);
        renderSkillTabs(cfg.skills);
        renderSkills(cfg.skills);
        if (cfg.education) renderEdu(cfg.education);
        if (cfg.certifications) renderCerts(cfg.certifications);
        if (cfg.languages) renderLangs(cfg.languages);
        observeAll();
    })
    .catch(function(err) {
        console.error('Error:', err);
        showError(err.message);
    });

function showError(message) {
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:60px;left:0;right:0;z-index:99;background:#dc2626;color:#fff;padding:1rem 2rem;text-align:center;font-size:0.9rem;font-family:monospace;';
    banner.innerHTML = '<strong>Error loading portfolio:</strong> ' + message + '<br><small>Check that config.json exists and is valid JSON. Open browser console (F12) for details.</small>';
    document.body.appendChild(banner);
}

function getRoleLabel(key) {
    return ROLES[key] ? ROLES[key].label : key;
}
function getRoleColor(key) {
    return ROLES[key] ? ROLES[key].color : '#666';
}
function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

// ─── Synced filter ───
var currentFilter = 'all';

function applyFilter(filter) {
    currentFilter = filter;

    // Update project tabs
    document.querySelectorAll('#projectTabs .tab-btn').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === filter);
    });
    // Update skill tabs
    document.querySelectorAll('#skillTabs .skill-tab').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === filter);
    });

    // Filter projects
    document.querySelectorAll('.flip-container').forEach(function(c) {
        if (filter === 'all' || c.getAttribute('data-role') === filter) {
            c.classList.remove('hidden');
            c.classList.remove('visible');
            setTimeout(function() { c.classList.add('visible'); }, 50);
        } else {
            c.classList.add('hidden');
        }
    });

    // Filter skills
    document.querySelectorAll('.skill-category').forEach(function(c) {
        if (filter === 'all' || c.getAttribute('data-role') === filter) {
            c.classList.remove('skill-hidden');
            c.classList.remove('visible');
            setTimeout(function() { c.classList.add('visible'); }, 50);
        } else {
            c.classList.add('skill-hidden');
        }
    });

    // Style active tabs with role color
    styleActiveTabs(filter);
}

function styleActiveTabs(filter) {
    var color = filter !== 'all' ? getRoleColor(filter) : null;

    // Style all tab buttons with their role's hover color
    var allTabs = document.querySelectorAll('#projectTabs .tab-btn, #skillTabs .skill-tab');
    for (var i = 0; i < allTabs.length; i++) {
        (function(btn) {
            var btnFilter = btn.getAttribute('data-filter');
            var btnColor = btnFilter !== 'all' ? getRoleColor(btnFilter) : null;

            if (btn.classList.contains('active') && color) {
                btn.style.background = color;
                btn.style.borderColor = color;
                btn.style.color = '#fff';
            } else if (btn.classList.contains('active') && !color) {
                // "All" active - use defaults
                if (btn.closest('#skillTabs')) {
                    btn.style.background = '#e8a838';
                    btn.style.borderColor = '#e8a838';
                    btn.style.color = '#2c3e5a';
                } else {
                    btn.style.background = '#2c3e5a';
                    btn.style.borderColor = '#2c3e5a';
                    btn.style.color = '#fff';
                }
            } else {
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }

            // Set hover with role color for non-active buttons
            btn.onmouseenter = function() {
                if (!btn.classList.contains('active') && btnColor) {
                    btn.style.borderColor = btnColor;
                    btn.style.color = btnColor;
                }
            };
            btn.onmouseleave = function() {
                if (!btn.classList.contains('active')) {
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }
            };
        })(allTabs[i]);
    }
}

// ─── Hero ───
function renderHero(h, count) {
    document.getElementById('heroName').textContent = h.name;
    document.getElementById('heroSubtitle').textContent = h.subtitle;
    document.getElementById('heroLinks').innerHTML = '<a href="' + sanitizeUrl(h.linkedin) + '" target="_blank">LinkedIn</a><a href="#projects">Projects</a>';
    var statsHtml = '';
    for (var i = 0; i < h.stats.length; i++) {
        var num = h.stats[i].number === 'auto' ? count + '+' : sanitize(h.stats[i].number);
        statsHtml += '<div class="stat"><span class="number">' + num + '</span><span class="label">' + sanitize(h.stats[i].label) + '</span></div>';
    }
    document.getElementById('heroStats').innerHTML = statsHtml;
    var initials = h.name.split(' ').map(function(w) { return w[0]; }).filter(function(c) { return c === c.toUpperCase(); });
    if (initials.length >= 4) {
        document.getElementById('navLogo').innerHTML = sanitize(initials.slice(0,2).join('')) + '<span>' + sanitize(initials.slice(2,4).join('')) + '</span>';
    }
    document.getElementById('footerLinks').innerHTML = '<a href="' + sanitizeUrl(h.linkedin) + '" target="_blank">LinkedIn</a><a href="#projects">Projects</a><a href="#skills">Skills</a>';
    document.getElementById('footerCopy').innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + sanitize(h.name) + '. All rights reserved.';
}

// ─── Project Tabs ───
function renderTabs(projects) {
    var el = document.getElementById('projectTabs');
    var roleCounts = {};
    projects.forEach(function(p) {
        if (!roleCounts[p.role]) roleCounts[p.role] = 0;
        roleCounts[p.role]++;
    });
    var html = '<button class="tab-btn active" data-filter="all">All <span class="tab-count">' + projects.length + '</span></button>';
    // Use ROLES order so tabs are consistent
    for (var k in ROLES) {
        if (roleCounts[k]) {
            html += '<button class="tab-btn" data-filter="' + k + '">' + sanitize(getRoleLabel(k)) + ' <span class="tab-count">' + roleCounts[k] + '</span></button>';
        }
    }
    el.innerHTML = html;
    el.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.onclick = function() { applyFilter(btn.getAttribute('data-filter')); };
    });
}

// ─── Project Cards ───
function renderCards(projects) {
    var grid = document.getElementById('projectsGrid');
    var html = '';
    for (var i = 0; i < projects.length; i++) {
        var p = projects[i];
        var images = getImages(p);
        var hasImg = images.length > 0;
        var imgCount = images.length;
        var roleLabel = sanitize(getRoleLabel(p.role));
        var roleColor = getRoleColor(p.role);

        html += '<div class="flip-container fade-in ' + (hasImg ? 'has-image' : '') + '" data-role="' + sanitize(p.role) + '">';
        html += '<div class="flip-inner">';
        html += '<div class="flip-front"><div>';
        html += '<span class="project-number">' + sanitize(p.id) + '</span>';
        html += '<div class="card-top"><p class="company">' + sanitize(p.company) + '</p></div>';
        html += '<h3>' + sanitize(p.title) + '</h3>';
        html += '<p class="desc">' + sanitize(p.description) + '</p>';
        html += '<span class="desc-toggle">Read more</span>';
        html += '<div class="impact">' + sanitize(p.impact) + '</div>';
        html += '</div><div>';
        html += '<div class="tech-tags">';
        for (var t = 0; t < p.tech.length; t++) html += '<span>' + sanitize(p.tech[t]) + '</span>';
        html += '</div>';
        html += '<div class="card-bottom">';
        html += '<span class="role-badge" style="background:' + hexToRgba(roleColor, 0.08) + ';color:' + roleColor + '">' + roleLabel + '</span>';
        if (hasImg) {
            var label = imgCount > 1 ? 'Click to preview (' + imgCount + ')' : 'Click to preview';
            html += '<div class="flip-hint"><span class="flip-hint-icon">[+]</span> ' + label + '</div>';
        }
        html += '</div></div></div>';

        if (hasImg) {
            html += '<div class="flip-back" data-images=\'' + JSON.stringify(images) + '\' data-title="' + sanitize(p.title) + '" data-company="' + sanitize(p.company) + '">';
            html += '<img class="back-image" src="' + sanitize(images[0]) + '" alt="' + sanitize(p.title) + '" loading="lazy">';
            html += '<div class="back-overlay"><div>';
            html += '<div class="back-company">' + sanitize(p.company) + '</div>';
            html += '<div class="back-title">' + sanitize(p.title) + '</div>';
            html += '</div><div class="back-hint">';
            html += imgCount > 1 ? 'Double-click to browse ' + imgCount + ' images' : 'Double-click to expand';
            html += '</div></div></div>';
        }
        html += '</div></div>';
    }
    grid.innerHTML = html;

    var cards = grid.querySelectorAll('.flip-container.has-image');
    for (var c = 0; c < cards.length; c++) {
        (function(card) {
            var back = card.querySelector('.flip-back');
            card.onclick = function() { card.classList.toggle('flipped'); };
            card.ondblclick = function(e) {
                if (card.classList.contains('flipped') && back) {
                    e.stopPropagation();
                    openLightbox(JSON.parse(back.getAttribute('data-images')), back.getAttribute('data-title'), back.getAttribute('data-company'));
                }
            };
            card.addEventListener('mouseleave', function() {
                if (card.classList.contains('flipped')) {
                    card.classList.remove('flipped');
                }
            });
        })(cards[c]);
    }

    requestAnimationFrame(function() {
        var toggles = grid.querySelectorAll('.desc-toggle');
        for (var d = 0; d < toggles.length; d++) {
            (function(toggle) {
                var desc = toggle.previousElementSibling;
                var card = toggle.closest('.flip-container');
                if (desc.scrollHeight <= desc.clientHeight + 2) {
                    toggle.style.display = 'none';
                }
                toggle.onclick = function(e) {
                    e.stopPropagation();
                    if (desc.classList.contains('expanded')) {
                        desc.classList.remove('expanded');
                        card.classList.remove('desc-open');
                        toggle.textContent = 'Read more';
                    } else {
                        desc.classList.add('expanded');
                        if (!card.classList.contains('has-image')) card.classList.add('desc-open');
                        toggle.textContent = 'Read less';
                    }
                };
                card.addEventListener('mouseleave', function() {
                    if (desc.classList.contains('expanded')) {
                        desc.classList.remove('expanded');
                        card.classList.remove('desc-open');
                        toggle.textContent = 'Read more';
                    }
                });
            })(toggles[d]);
        }
    });
}

// ─── Lightbox ───
var lbImages = [];
var lbIndex = 0;

function openLightbox(images, title, company) {
    lbImages = images; lbIndex = 0;
    document.getElementById('lbTitle').textContent = title;
    document.getElementById('lbCompany').textContent = company;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxImage();
}
function updateLightboxImage() {
    document.getElementById('lbImg').src = lbImages[lbIndex];
    var counter = document.getElementById('lbCounter');
    var prev = document.getElementById('lbPrev');
    var next = document.getElementById('lbNext');
    if (lbImages.length > 1) {
        counter.textContent = (lbIndex+1) + ' / ' + lbImages.length;
        counter.style.display = 'block';
        prev.style.display = 'flex'; next.style.display = 'flex';
        prev.className = 'lightbox-nav lb-prev' + (lbIndex === 0 ? ' lb-disabled' : '');
        next.className = 'lightbox-nav lb-next' + (lbIndex === lbImages.length-1 ? ' lb-disabled' : '');
    } else {
        counter.style.display = 'none';
        prev.style.display = 'none'; next.style.display = 'none';
    }
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
    lbImages = []; lbIndex = 0;
}
document.getElementById('lbClose').onclick = function(e) { e.stopPropagation(); closeLightbox(); };
document.getElementById('lbPrev').onclick = function(e) { e.stopPropagation(); if (lbIndex > 0) { lbIndex--; updateLightboxImage(); } };
document.getElementById('lbNext').onclick = function(e) { e.stopPropagation(); if (lbIndex < lbImages.length-1) { lbIndex++; updateLightboxImage(); } };
document.getElementById('lightbox').onclick = function(e) { if (e.target === this) closeLightbox(); };
document.onkeydown = function(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbIndex > 0) { lbIndex--; updateLightboxImage(); }
    if (e.key === 'ArrowRight' && lbIndex < lbImages.length-1) { lbIndex++; updateLightboxImage(); }
};

// ─── Skill Tabs ───
function renderSkillTabs(skills) {
    var el = document.getElementById('skillTabs');
    var roleCounts = {};
    for (var i = 0; i < skills.length; i++) {
        var r = skills[i].role;
        if (!roleCounts[r]) roleCounts[r] = 0;
        roleCounts[r]++;
    }
    var html = '<button class="tab-btn skill-tab active" data-filter="all">All <span class="tab-count">' + skills.length + '</span></button>';
    // Use ROLES order so tabs match projects
    for (var k in ROLES) {
        if (roleCounts[k]) {
            html += '<button class="tab-btn skill-tab" data-filter="' + k + '">' + sanitize(getRoleLabel(k)) + ' <span class="tab-count">' + roleCounts[k] + '</span></button>';
        }
    }
    el.innerHTML = html;
    el.querySelectorAll('.skill-tab').forEach(function(btn) {
        btn.onclick = function() { applyFilter(btn.getAttribute('data-filter')); };
    });
}

// ─── Skill Cards ───
function renderSkills(skills) {
    var grid = document.getElementById('skillsGrid');
    var html = '';
    for (var i = 0; i < skills.length; i++) {
        var s = skills[i];
        html += '<div class="skill-category fade-in" data-role="' + sanitize(s.role) + '">';
        html += '<h3>' + sanitize(s.category) + '</h3>';
        html += '<div class="skill-list">';
        for (var j = 0; j < s.items.length; j++) html += '<span>' + sanitize(s.items[j]) + '</span>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
}

// ─── Education ───
function renderEdu(items) {
    var el = document.getElementById('eduContainer');
    for (var i = 0; i < items.length; i++) {
        var d = document.createElement('div'); d.className = 'edu-item';
        d.innerHTML = '<h4>' + sanitize(items[i].degree) + '</h4><p class="school">' + sanitize(items[i].school) + '</p><p class="year">' + sanitize(items[i].year) + '</p>';
        el.appendChild(d);
    }
}

// ─── Certifications ───
function renderCerts(items) {
    var el = document.getElementById('certContainer');
    var ul = document.createElement('ul'); ul.className = 'cert-list';
    for (var i = 0; i < items.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = '<span>' + sanitize(items[i].name) + '</span><span class="provider">' + sanitize(items[i].provider) + '</span>';
        ul.appendChild(li);
    }
    el.appendChild(ul);
}

// ─── Languages ───
function renderLangs(items) {
    var html = '';
    for (var i = 0; i < items.length; i++)
        html += '<div class="language-badge"><span>' + sanitize(items[i].name) + '</span><span class="level">' + sanitize(items[i].level) + '</span></div>';
    document.getElementById('langContainer').innerHTML = html;
}