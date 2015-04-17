/* global session */
module.exports = {
    "parameters": {
        "name": "RADAR"
    },
    "skipFunctions": {
        "exampleSkip": function() {
            return false;
        },
        "drugSkip": function(drugVar) {
            if (typeof global.network !== 'undefined') {
                var properties = {};
                properties[drugVar] = 1;

                // are there actually any drug edges?
                var drugEdges = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id, type:'Drugs'});
                var required = global.network.getNodes(properties);

                if (drugEdges.length === 0 || required.length === 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        "seedSkip": function() {
            if (typeof global.network !== 'undefined') {
                var required = global.network.getNodes({seed_status_t0:'Non-Seed'});
                if (required.length === 0) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        "mapSkip": function() {
            // Don't show map if no participants are from chicago
            if (typeof global.network !== 'undefined') {
                var totalEdges = global.network.getEdges({type:'Dyad', res_cat_p_t0: 'Chicago'});
                if (totalEdges.length > 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },
        "sexPartnerSkip": function() {
            // Don't show if ego has had no sex partners
            if (typeof global.network !== 'undefined') {
                var totalEdges = global.network.getEdges({type:'Sex', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                if (totalEdges.length > 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },
        "vaginalSexSkip": function() {
            // need to skip male participant with only male sex partners or female participant with only female sex partners
              if (typeof global.network !== 'undefined') {
                  // Skip if there are no sex edges between ego and some alters
                  var sexEdges = global.network.getEdges({type:'Sex', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                  if (sexEdges.length > 0) {
                      // Get ego gender
                      var egoGender = global.network.getNodes({type_t0:'Ego'})[0].gender_k;
                      // Get total edges ready for counting
                      var totalEdges = global.network.getEdges({type:'Dyad', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                      // Get male edges ready for counting
                      var maleEdges = global.network.getEdges({type:'Dyad', from:global.network.getNodes({type_t0:'Ego'})[0].id, gender_p_t0: 'Male'});
                      // Get female edges ready for counting
                      var femaleEdges = global.network.getEdges({type:'Dyad', gender_p_t0: 'Female'});
                      // If ego is male AND total edges is the same as male edges
                      // OR
                      // If ego is female and total edges is the same as female edges
                      if ((egoGender === 'Male' && totalEdges.length === maleEdges.length) || (egoGender === 'Female' && totalEdges.length === femaleEdges.length)) {
                          // Skip
                          return true;
                      } else {
                          // Don't skip
                          return false;
                      }
                  } else {
                      // Skip if there are no sex edges
                      return true;
                  }
              } else {
                  // Don't skip if global.network is undefined
                  return false;
              }
        },
        "analSexSkip": function() {
            // need to skip female participant with only female sex partners
            if (typeof global.network !== 'undefined') {
                var sexEdges = global.network.getEdges({type:'Sex', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                if (sexEdges.length > 0) {
                    var totalEdges = global.network.getEdges({type:'Dyad', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                    var femaleEdges = global.network.getEdges({type:'Dyad', from:global.network.getNodes({type_t0:'Ego'})[0].id, gender_p_t0: 'Female'});
                    if (global.network.getNodes({type_t0:'Ego'})[0].gender_k === 'Female' && totalEdges.length === femaleEdges.length) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                  return true;
                }
            } else {
                console.log('global.network undefined.');
                return false;
            }
        },
        "multiSexPartnerSkip": function() {
            if (typeof global.network !== 'undefined') {
                var sexEdges = global.network.getEdges({type:'Sex', from:global.network.getNodes({type_t0:'Ego'})[0].id});
                if (sexEdges.length > 0) {
                    // it is required that ego has answerd 'yes' to the multiple sex question
                    var required = global.network.getNodes({multiple_sex_t0: 'yes'});
                    if (required.length === 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    // Skip if there are no sex edges
                    return true;
                }
            } else {
                return false;
            }
        }
    },
    "stages": [
        {label:'Intro', page:'intro.html'},
        {label:'NG: closest', page:'namegen1.html'},
        {label:'NG: marijuana or other drugs', page:'namegen5.html'},
        {label:'NG: drugs, two or more', page:'namegenmod6.html'},
        {label:'NG: other people sex', page:'namegen7.html'},
        {label:'NG: sex, two or more', page:'namegenmod8.html'},
        {label:'NET: layout', page:'canvaslayout.html'},
        {label:'NET EDGE: social', page:'canvasedge1.html'},
        {label:'NET NI: who recruited', page:'canvasselect2.html', skip: function() { return session.skipFunctions.seedSkip(); }},
        {label:'NET NI: who drunk with', page:'canvasselect3.html'},
        {label:'NET NI: who drugs with', page:'canvasselect4.html'},
        {label:'NET NI: who sex with', page:'canvasselect5.html'},
        {label:'ORD: contact frequency', page:'ordbin1a.html'},
        {label:'ORD: relationship strength', page:'ordbin1.html'},
        {label:'NET NI: get advice', page:'canvasselect6.html'},
        {label:'NET NI: Serious relationship?', page:'canvasselect8.html'},
        {label:'CAT: gender identity', page:'multibin5.html'},
        {label:'RACE: Hispanic or Latino', page:'canvasselect14.html'},
        {label:'RACE: Racial Identity', page:'multibin2.html'},
        {label:'CAT: sexuality', page:'multibin3.html'},
        {label:'CAT: location', page:'multibin4.html'},
        {label:'MAP: location in Chicago', page:'map1.html', skip: function() { return session.skipFunctions.mapSkip(); }},
        {label:'LIST SELECT: which drugs?', page:'listselect1.html'},
        {label:'ORD: Marijuana freq', page:'ordbin6.html',skip: function() { return session.skipFunctions.drugSkip('d1_t0'); }},
        {label:'ORD: Cocaine or Crack freq', page:'ordbin7.html', skip: function() { return session.skipFunctions.drugSkip('d2_t0'); }},
        {label:'ORD: Heroin freq', page:'ordbin8.html', skip: function() { return session.skipFunctions.drugSkip('d3_t0'); }},
        {label:'ORD: Methamphetamines freq', page:'ordbin9.html', skip: function() { return session.skipFunctions.drugSkip('d4_t0'); }},
        {label:'ORD: Painkillers or Opiates freq', page:'ordbin10.html', skip: function() { return session.skipFunctions.drugSkip('d5_t0'); }},
        {label:'ORD: Poppers freq', page:'ordbin11.html', skip: function() { return session.skipFunctions.drugSkip('d6_t0'); }},
        {label:'ORD: Stimulants or Amphetamines freq', page:'ordbin12.html', skip: function() { return session.skipFunctions.drugSkip('d7_t0'); }},
        {label:'ORD: Depressants or Tranquilizers freq', page:'ordbin13.html', skip: function() { return session.skipFunctions.drugSkip('d8_t0'); }},
        {label:'ORD: Ecstasy freq', page:'ordbin14.html', skip: function() { return session.skipFunctions.drugSkip('d9_t0'); }},
        {label:'ORD: Other Drugs freq', page:'ordbin15.html', skip: function() { return session.skipFunctions.drugSkip('d10_t0'); }},
        {label:'NET EDGE: drugs', page:'canvasedge2.html'},
        {label:'CAT: where met sex partners', page:'multibin6.html', skip: function() { return session.skipFunctions.sexPartnerSkip(); }},
        {label:'DATE: first and last sex', page:'dateinterface1.html', skip: function() { return session.skipFunctions.sexPartnerSkip(); }},
        {label:'CAT: HIV status of sex partners', page:'multibin7.html', skip: function() { return session.skipFunctions.sexPartnerSkip(); }},
        {label:'CAT: Vaginal sex?', page:'multibin9.html', skip: function() { return session.skipFunctions.vaginalSexSkip(); }},
        {label:'CAT: Anal sex?', page:'multibin10.html', skip: function() { return session.skipFunctions.analSexSkip(); }},
        {label:'NET EDGE: sex', page:'canvasedge3.html'},
        {label:'SWITCH: multiple sex partners', page:'multiplepartners.html', skip: function() { return session.skipFunctions.sexPartnerSkip(); }},
        {label:'NET NI: who multiple sex partners', page:'canvasselect7.html', skip: function() {return session.skipFunctions.multiSexPartnerSkip(); }},
        {label:'Thank You', page:'thanks.html'},
        {label:'Download Data', page:'download.html'},
        {label:'Finish', page:'finish.html'}
    ]
};
