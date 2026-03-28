var Ajv = require('ajv');
var fs = require('fs');
var path = require('path');

var ajv = new Ajv({ allErrors: true });

// Define the expected schema for config.json
var schema = {
    type: 'object',
    required: ['roles', 'hero', 'about', 'projects', 'skills', 'education', 'certifications', 'languages'],
    properties: {
        roles: {
            type: 'object',
            minProperties: 1,
            additionalProperties: {
                type: 'object',
                required: ['label', 'color'],
                properties: {
                    label: { type: 'string', minLength: 1 },
                    color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }
                }
            }
        },
        hero: {
            type: 'object',
            required: ['name', 'subtitle', 'linkedin', 'stats'],
            properties: {
                name: { type: 'string', minLength: 1 },
                subtitle: { type: 'string', minLength: 1 },
                linkedin: { type: 'string', minLength: 1 },
                stats: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        required: ['number', 'label'],
                        properties: {
                            number: { type: 'string' },
                            label: { type: 'string' }
                        }
                    }
                }
            }
        },
        about: { type: 'string', minLength: 10 },
        projects: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['id', 'title', 'company', 'role', 'description', 'impact', 'tech'],
                properties: {
                    id: { type: 'string', minLength: 1 },
                    title: { type: 'string', minLength: 1 },
                    company: { type: 'string', minLength: 1 },
                    role: { type: 'string', minLength: 1 },
                    description: { type: 'string', minLength: 10 },
                    impact: { type: 'string', minLength: 1 },
                    tech: { type: 'array', minItems: 1, items: { type: 'string' } },
                    image: {
                        oneOf: [
                            { type: 'string' },
                            { type: 'array', items: { type: 'string' } }
                        ]
                    }
                }
            }
        },
        skills: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['category', 'role', 'items'],
                properties: {
                    category: { type: 'string', minLength: 1 },
                    role: { type: 'string', minLength: 1 },
                    items: { type: 'array', minItems: 1, items: { type: 'string' } }
                }
            }
        },
        education: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['degree', 'school', 'year'],
                properties: {
                    degree: { type: 'string' },
                    school: { type: 'string' },
                    year: { type: 'string' }
                }
            }
        },
        certifications: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'provider'],
                properties: {
                    name: { type: 'string' },
                    provider: { type: 'string' }
                }
            }
        },
        languages: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['name', 'level'],
                properties: {
                    name: { type: 'string' },
                    level: { type: 'string' }
                }
            }
        }
    }
};

// Load and validate
var configPath = path.join(__dirname, '..', 'config.json');
var config;

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('✓ config.json is valid JSON');
} catch (e) {
    console.error('✗ config.json is NOT valid JSON:', e.message);
    process.exit(1);
}

var validate = ajv.compile(schema);
var valid = validate(config);

if (valid) {
    console.log('✓ config.json matches expected schema');
} else {
    console.error('✗ Schema validation errors:');
    validate.errors.forEach(function(err) {
        console.error('  -', err.instancePath, err.message);
    });
    process.exit(1);
}

// Check that all project roles exist in roles definition
var roles = Object.keys(config.roles);
var errors = [];

config.projects.forEach(function(p) {
    if (roles.indexOf(p.role) === -1) {
        errors.push('Project "' + p.title + '" has role "' + p.role + '" which is not defined in roles');
    }
});

config.skills.forEach(function(s) {
    if (roles.indexOf(s.role) === -1) {
        errors.push('Skill "' + s.category + '" has role "' + s.role + '" which is not defined in roles');
    }
});

// Check for duplicate project IDs
var ids = {};
config.projects.forEach(function(p) {
    if (ids[p.id]) {
        errors.push('Duplicate project ID: "' + p.id + '"');
    }
    ids[p.id] = true;
});

// Check image paths exist
config.projects.forEach(function(p) {
    var images = [];
    if (typeof p.image === 'string' && p.image.trim() !== '') {
        images = [p.image];
    } else if (Array.isArray(p.image)) {
        images = p.image.filter(function(i) { return i && i.trim() !== ''; });
    }
    images.forEach(function(img) {
        var imgPath = path.join(__dirname, '..', img);
        if (!fs.existsSync(imgPath)) {
            errors.push('Project "' + p.title + '" references image "' + img + '" which does not exist');
        }
    });
});

if (errors.length > 0) {
    console.error('✗ Content validation errors:');
    errors.forEach(function(e) { console.error('  -', e); });
    process.exit(1);
} else {
    console.log('✓ All roles are valid');
    console.log('✓ No duplicate project IDs');
    console.log('✓ All image paths exist');
    console.log('\n  Projects: ' + config.projects.length);
    console.log('  Skills: ' + config.skills.length + ' categories');
    console.log('  Roles: ' + roles.join(', '));
    console.log('\nAll schema tests passed!');
}
