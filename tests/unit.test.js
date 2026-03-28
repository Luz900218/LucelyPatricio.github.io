// Unit tests for helper functions from script.js

// ─── Recreate functions to test (since script.js is browser-only) ───

function getImages(p) {
    if (!p.image) return [];
    if (typeof p.image === 'string') return p.image.trim() !== '' ? [p.image] : [];
    if (Array.isArray(p.image)) return p.image.filter(function(i) { return i && i.trim() !== ''; });
    return [];
}

function getRoleLabel(ROLES, key) {
    return ROLES[key] ? ROLES[key].label : key;
}

function getRoleColor(ROLES, key) {
    return ROLES[key] ? ROLES[key].color : '#666';
}

function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

// ─── Test Data ───

var ROLES = {
    dev:  { label: 'Software Developer', color: '#3b82f6' },
    data: { label: 'Data Analytics',     color: '#7c3aed' },
    auto: { label: 'Ind Automation',     color: '#059669' }
};

// ─── getImages Tests ───

describe('getImages', function() {
    test('returns empty array when image is empty string', function() {
        expect(getImages({ image: '' })).toEqual([]);
    });

    test('returns empty array when image is undefined', function() {
        expect(getImages({})).toEqual([]);
    });

    test('returns empty array when image is null', function() {
        expect(getImages({ image: null })).toEqual([]);
    });

    test('returns single-item array when image is a non-empty string', function() {
        expect(getImages({ image: 'images/test.png' })).toEqual(['images/test.png']);
    });

    test('returns the array when image is an array of strings', function() {
        expect(getImages({ image: ['img1.png', 'img2.png'] })).toEqual(['img1.png', 'img2.png']);
    });

    test('filters empty strings from image array', function() {
        expect(getImages({ image: ['img1.png', '', 'img3.png'] })).toEqual(['img1.png', 'img3.png']);
    });

    test('returns empty array when image array has only empty strings', function() {
        expect(getImages({ image: ['', '  ', ''] })).toEqual([]);
    });

    test('handles whitespace-only string', function() {
        expect(getImages({ image: '   ' })).toEqual([]);
    });
});

// ─── getRoleLabel Tests ───

describe('getRoleLabel', function() {
    test('returns correct label for dev', function() {
        expect(getRoleLabel(ROLES, 'dev')).toBe('Software Developer');
    });

    test('returns correct label for data', function() {
        expect(getRoleLabel(ROLES, 'data')).toBe('Data Analytics');
    });

    test('returns correct label for auto', function() {
        expect(getRoleLabel(ROLES, 'auto')).toBe('Ind Automation');
    });

    test('returns the key itself when role does not exist', function() {
        expect(getRoleLabel(ROLES, 'unknown')).toBe('unknown');
    });

    test('returns key for empty ROLES object', function() {
        expect(getRoleLabel({}, 'dev')).toBe('dev');
    });
});

// ─── getRoleColor Tests ───

describe('getRoleColor', function() {
    test('returns correct color for dev', function() {
        expect(getRoleColor(ROLES, 'dev')).toBe('#3b82f6');
    });

    test('returns correct color for data', function() {
        expect(getRoleColor(ROLES, 'data')).toBe('#7c3aed');
    });

    test('returns fallback color for unknown role', function() {
        expect(getRoleColor(ROLES, 'unknown')).toBe('#666');
    });
});

// ─── hexToRgba Tests ───

describe('hexToRgba', function() {
    test('converts blue correctly', function() {
        expect(hexToRgba('#3b82f6', 0.08)).toBe('rgba(59,130,246,0.08)');
    });

    test('converts black', function() {
        expect(hexToRgba('#000000', 1)).toBe('rgba(0,0,0,1)');
    });

    test('converts white', function() {
        expect(hexToRgba('#ffffff', 0.5)).toBe('rgba(255,255,255,0.5)');
    });

    test('converts green correctly', function() {
        expect(hexToRgba('#059669', 0.08)).toBe('rgba(5,150,105,0.08)');
    });
});

// ─── Config Consistency Tests ───

describe('Config consistency', function() {
    var config = require('../config.json');

    test('all project roles exist in roles definition', function() {
        var validRoles = Object.keys(config.roles);
        config.projects.forEach(function(p) {
            expect(validRoles).toContain(p.role);
        });
    });

    test('all skill roles exist in roles definition', function() {
        var validRoles = Object.keys(config.roles);
        config.skills.forEach(function(s) {
            expect(validRoles).toContain(s.role);
        });
    });

    test('no duplicate project IDs', function() {
        var ids = config.projects.map(function(p) { return p.id; });
        var unique = ids.filter(function(id, i) { return ids.indexOf(id) === i; });
        expect(ids.length).toBe(unique.length);
    });

    test('every project has at least one tech tag', function() {
        config.projects.forEach(function(p) {
            expect(p.tech.length).toBeGreaterThan(0);
        });
    });

    test('every skill category has at least one item', function() {
        config.skills.forEach(function(s) {
            expect(s.items.length).toBeGreaterThan(0);
        });
    });

    test('hero stats contains auto for project count', function() {
        var hasAuto = config.hero.stats.some(function(s) { return s.number === 'auto'; });
        expect(hasAuto).toBe(true);
    });

    test('every role has both label and color', function() {
        for (var key in config.roles) {
            expect(config.roles[key]).toHaveProperty('label');
            expect(config.roles[key]).toHaveProperty('color');
            expect(config.roles[key].color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
    });
});
