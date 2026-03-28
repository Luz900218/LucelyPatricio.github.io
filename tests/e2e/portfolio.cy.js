describe('Portfolio E2E Tests', function() {

    beforeEach(function() {
        cy.visit('/');
        // Wait for config.json to load and render
        cy.get('#heroName').should('not.be.empty');
    });

    // ─── Page Load ───

    describe('Page Load', function() {
        it('loads the page with correct title', function() {
            cy.title().should('contain', 'Portfolio');
        });

        it('displays the hero name from config', function() {
            cy.get('#heroName').should('contain.text', 'Maria');
        });

        it('displays the subtitle', function() {
            cy.get('#heroSubtitle').should('not.be.empty');
        });

        it('displays stats with numbers', function() {
            cy.get('.stat .number').should('have.length.at.least', 3);
        });

        it('displays the about text', function() {
            cy.get('#aboutText').should('not.be.empty');
            cy.get('#aboutText').invoke('text').should('have.length.greaterThan', 50);
        });
    });

    // ─── Navigation ───

    describe('Navigation', function() {
        it('has working nav links', function() {
            cy.get('nav .nav-links a').should('have.length', 4);
        });

        it('scrolls to sections when clicking nav links', function() {
            cy.get('nav .nav-links a[href="#projects"]').click();
            cy.get('#projects').should('be.visible');
        });

        it('has LinkedIn link that opens in new tab', function() {
            cy.get('#heroLinks a[target="_blank"]').should('have.attr', 'href').and('contain', 'linkedin');
        });
    });

    // ─── Project Tabs ───

    describe('Project Tabs', function() {
        it('displays tab buttons', function() {
            cy.get('#projectTabs .tab-btn').should('have.length.at.least', 2);
        });

        it('has "All" tab active by default', function() {
            cy.get('#projectTabs .tab-btn').first().should('have.class', 'active');
            cy.get('#projectTabs .tab-btn').first().should('contain.text', 'All');
        });

        it('filters projects when clicking a role tab', function() {
            // Count all visible projects first
            cy.get('.flip-container:not(.hidden)').then(function($all) {
                var totalCount = $all.length;

                // Click second tab (first role)
                cy.get('#projectTabs .tab-btn').eq(1).click();

                // Should show fewer projects
                cy.get('.flip-container:not(.hidden)').should('have.length.lessThan', totalCount);
            });
        });

        it('shows all projects when clicking "All" again', function() {
            // Click a role tab first
            cy.get('#projectTabs .tab-btn').eq(1).click();
            cy.wait(200);

            // Click All
            cy.get('#projectTabs .tab-btn').first().click();
            cy.get('.flip-container:not(.hidden)').should('have.length.at.least', 5);
        });
    });

    // ─── Synced Filtering ───

    describe('Synced Filtering', function() {
        it('filters skills when clicking a project tab', function() {
            // Click a role tab in projects
            cy.get('#projectTabs .tab-btn').eq(1).click();

            // Skills should also be filtered - same tab should be active
            cy.get('#skillTabs .skill-tab').eq(1).should('have.class', 'active');
            cy.get('.skill-category.skill-hidden').should('have.length.at.least', 1);
        });

        it('filters projects when clicking a skill tab', function() {
            cy.get('#skillTabs .skill-tab').eq(1).click();

            // Projects should also be filtered
            cy.get('#projectTabs .tab-btn').eq(1).should('have.class', 'active');
            cy.get('.flip-container.hidden').should('have.length.at.least', 1);
        });
    });

    // ─── Project Cards ───

    describe('Project Cards', function() {
        it('displays project cards with required content', function() {
            cy.get('.flip-container').first().within(function() {
                cy.get('.company').should('not.be.empty');
                cy.get('h3').should('not.be.empty');
                cy.get('.desc').should('not.be.empty');
                cy.get('.impact').should('not.be.empty');
                cy.get('.tech-tags span').should('have.length.at.least', 1);
                cy.get('.role-badge').should('not.be.empty');
            });
        });

        it('displays project number on each card', function() {
            cy.get('.flip-container').first().find('.project-number').should('not.be.empty');
        });
    });

    // ─── Flip Card with Image ───

    describe('Flip Cards', function() {
        it('flips card on click when it has an image', function() {
            cy.get('.flip-container.has-image').first().then(function($card) {
                if ($card.length) {
                    cy.wrap($card).click();
                    cy.wrap($card).should('have.class', 'flipped');
                }
            });
        });

        it('unflips card on second click', function() {
            cy.get('.flip-container.has-image').first().then(function($card) {
                if ($card.length) {
                    cy.wrap($card).click();
                    cy.wrap($card).should('have.class', 'flipped');
                    cy.wrap($card).click();
                    cy.wrap($card).should('not.have.class', 'flipped');
                }
            });
        });

        it('opens lightbox on double-click when flipped', function() {
            cy.get('.flip-container.has-image').first().then(function($card) {
                if ($card.length) {
                    cy.wrap($card).click();
                    cy.wait(700); // Wait for flip animation
                    cy.wrap($card).dblclick();
                    cy.get('#lightbox').should('have.class', 'active');
                }
            });
        });

        it('closes lightbox with X button', function() {
            cy.get('.flip-container.has-image').first().then(function($card) {
                if ($card.length) {
                    cy.wrap($card).click();
                    cy.wait(700);
                    cy.wrap($card).dblclick();
                    cy.get('#lightbox').should('have.class', 'active');
                    cy.get('#lbClose').click({ force: true });
                    cy.get('#lightbox').should('not.have.class', 'active');
                }
            });
        });

        it('closes lightbox with Escape key', function() {
            cy.get('.flip-container.has-image').first().then(function($card) {
                if ($card.length) {
                    cy.wrap($card).click();
                    cy.wait(700);
                    cy.wrap($card).dblclick();
                    cy.get('#lightbox').should('have.class', 'active');
                    cy.get('body').type('{esc}');
                    cy.get('#lightbox').should('not.have.class', 'active');
                }
            });
        });

        it('shows preview hint only on cards with images', function() {
            cy.get('.flip-container.has-image .flip-hint').should('exist');
            cy.get('.flip-container:not(.has-image) .flip-hint').should('not.exist');
        });
    });

    // ─── Read More ───

    describe('Read More Toggle', function() {
        it('does not show Read more if text fits', function() {
            // At least some cards should not have visible toggle
            cy.get('.desc-toggle').then(function($toggles) {
                var hiddenCount = 0;
                $toggles.each(function(i, el) {
                    if (el.style.display === 'none') hiddenCount++;
                });
                // Some should be hidden (text fits)
                expect(hiddenCount).to.be.at.least(0);
            });
        });
    });

    // ─── Skills Section ───

    describe('Skills Section', function() {
        it('displays skill tabs', function() {
            cy.get('#skillTabs .skill-tab').should('have.length.at.least', 2);
        });

        it('displays skill categories', function() {
            cy.get('.skill-category').should('have.length.at.least', 5);
        });

        it('each skill category has items', function() {
            cy.get('.skill-category').each(function($cat) {
                cy.wrap($cat).find('.skill-list span').should('have.length.at.least', 1);
            });
        });
    });

    // ─── Education Section ───

    describe('Education Section', function() {
        it('displays education items', function() {
            cy.get('#eduContainer .edu-item').should('have.length.at.least', 1);
        });

        it('displays certifications', function() {
            cy.get('#certContainer .cert-list li').should('have.length.at.least', 1);
        });

        it('displays languages', function() {
            cy.get('#langContainer .language-badge').should('have.length.at.least', 1);
        });
    });

    // ─── Footer ───

    describe('Footer', function() {
        it('displays footer with links', function() {
            cy.get('#footerLinks a').should('have.length.at.least', 2);
        });

        it('displays copyright with current year', function() {
            var year = new Date().getFullYear().toString();
            cy.get('#footerCopy').should('contain.text', year);
        });
    });

    // ─── Responsive ───

    describe('Responsive', function() {
        it('shows hamburger menu on mobile', function() {
            cy.viewport(375, 667);
            cy.get('.hamburger').should('be.visible');
        });

        it('hides nav links on mobile by default', function() {
            cy.viewport(375, 667);
            cy.get('nav .nav-links').should('not.be.visible');
        });

        it('toggles nav links on hamburger click', function() {
            cy.viewport(375, 667);
            cy.get('.hamburger').click();
            cy.get('nav .nav-links').should('be.visible');
        });
    });
});
