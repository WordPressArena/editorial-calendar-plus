/*******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/
/*
 * This file contains unit tests for the editorial calendar.  It is only loaded
 * if you add the qunit=true parameter to the URL for the calendar.
 */

var editorial_calendar_plus_test = {

    post: {},

    testContent: 'This is the content of the <b>unit test &#8211 post</b>. <!--more--> This is content after the more tag to make sure we a reading it.',
    testContent2: 'This is the content of the <b>unit test &#8211 post</b>. <!--more--> This is content after the more tag to make sure we a reading it. - CHANGED',
    testContent3: 'This is the content of the <b>unit test &#8211 post</b>. <!--more--> This is content after the more tag to make sure we a reading it. - CHANGED DRAFT',

    runTests: function() {
        editorial_calendar_plus_test.isDraftsDrawerVisible = editorial_calendar_plus.isDraftsDrawerVisible;
        
        editorial_calendar_plus.setDraftsDrawerVisible(true, function() {
            editorial_calendar_plus_test.startTests();
        });
    },

    startTests: function() {
        jQuery('head').append('<link>');
        css = jQuery('head').children(':last');
        css.attr({
            rel: 'stylesheet',
            type: 'text/css',
            href: editorial_calendar_plus.plugin_url + '/lib/qunit.css'
        });

        jQuery('#wpbody-content .wrap').append('<div id="editorial_calendar_plus-qunit"></div>');

        jQuery('#editorial_calendar_plus-qunit').append('<h1 id="qunit-header">WordPress Editorial Calendar Unit Tests</h1>' +
                                      '<h2 id="qunit-banner"></h2>' + 
                                      '<div id="qunit-testrunner-toolbar"></div>' + 
                                      '<h2 id="qunit-userAgent"></h2>' + 
                                      '<ol id="qunit-tests"></ol>' + 
                                      '<div id="qunit-fixture">test markup</div>');


        editorial_calendar_plus_test.moveTests();
    },

    getFirstDate: function() {
         var api = jQuery('#editorial_calendar_plus_scrollable').scrollable();
         var items = api.getVisibleItems();

         return editorial_calendar_plus.getDayFromDayId(items.eq(0).children('.editorial_calendar_plus_row').children('.day:first').attr('id'));
    },

    getLastDate: function() {
         var api = jQuery('#editorial_calendar_plus_scrollable').scrollable();
         var items = api.getVisibleItems();

         return editorial_calendar_plus.getDayFromDayId(items.eq(editorial_calendar_plus.weeksPref - 1).children('.editorial_calendar_plus_row').children('.day:last').attr('id'));
    },

    moveTests: function() {
         var curSunday = editorial_calendar_plus.nextStartOfWeek(Date.today()).add(-1).weeks();

         editorial_calendar_plus.moveTo(Date.today());

         /*
          * We'll start of with a series of tests about moving the calendar around
          */
         test('Move to today and check visible dates', function() {
             expect(2);
             ok(editorial_calendar_plus_test.getFirstDate().equals(curSunday.clone()), 'firstDate should match ' + curSunday);

             ok(editorial_calendar_plus_test.getLastDate().equals(curSunday.clone().add(editorial_calendar_plus.weeksPref).weeks().add(-1).days()),
                'lastDate should match ' + curSunday);
         });

         asyncTest('Move 1 week in the future and check visible dates', function() {
             expect(2);
             editorial_calendar_plus.move(1, true, function() {
                 ok(editorial_calendar_plus_test.getFirstDate().equals(curSunday.clone().add(1).weeks()), 'firstDate should match ' + curSunday);

                 ok(editorial_calendar_plus_test.getLastDate().equals(curSunday.clone().add(editorial_calendar_plus.weeksPref).weeks().add(-1).days().add(1).weeks()),
                    'lastDate should match ' + curSunday);

                 editorial_calendar_plus.move(1, false, function() {
                     start();
                     editorial_calendar_plus_test.testMoveFourWeeks();
                 });
             });
         });

         return;

    },

    testMoveFourWeeks: function() {
         var curSunday = editorial_calendar_plus.nextStartOfWeek(Date.today()).add(-1).weeks();

         /*
          * Now we'll move 4 weeks into the future
          */
         asyncTest('Move 4 weeks in the future and check visible dates', function() {
             expect(2);

             editorial_calendar_plus.move(4, true, function() {
                 ok(editorial_calendar_plus_test.getFirstDate().equals(curSunday.clone().add(4).weeks()), 'firstDate should match ' + curSunday);

                 ok(editorial_calendar_plus_test.getLastDate().equals(curSunday.clone().add(editorial_calendar_plus.weeksPref).weeks().add(-1).days().add(4).weeks()),
                    'lastDate should match ' + curSunday);

                 editorial_calendar_plus.move(4, false, function() {
                     start();
                     editorial_calendar_plus_test.testMoveEightWeeks();
                 });
             });


         });
    },

    testMoveEightWeeks: function() {
         var curSunday = editorial_calendar_plus.nextStartOfWeek(Date.today()).add(-1).weeks();

         /*
          * Now 8 weeks into the past
          */
         asyncTest('Move 8 weeks in the past and check visible dates', function() {
             expect(2);

             editorial_calendar_plus.move(8, false, function() {
                 ok(editorial_calendar_plus_test.getFirstDate().equals(curSunday.clone().add(-8).weeks()), 'firstDate should match ' + curSunday);

                 ok(editorial_calendar_plus_test.getLastDate().equals(curSunday.clone().add(editorial_calendar_plus.weeksPref).weeks().add(-1).days().add(-8).weeks()),
                    'lastDate should match ' + curSunday);

                 editorial_calendar_plus.move(8, true, function() {
                     start();
                     editorial_calendar_plus_test.testMoveToLast();
                 });
             });


         });
    },
    
    testMoveToLast: function() {
         if (editorial_calendar_plus.lastPostDate === '-1') {
             /*
              * Then there aren't any posts and we can't go
              * to the last one so we just skip this test.
              */
             editorial_calendar_plus_test.testCreatePost();
             return;
         }
         
         var d = Date.parseExact(editorial_calendar_plus.lastPostDate, 'ddMMyyyy');
         var curSunday = editorial_calendar_plus.nextStartOfWeek(d).add(-1).weeks();

         /*
          * Now move to the last post, get the post date, and make sure the post
          * is there with the correct ID.
          */
         asyncTest('Move to the last post', function() {
             expect(1);

             editorial_calendar_plus.moveTo(d);
             editorial_calendar_plus.getPosts(editorial_calendar_plus.nextStartOfWeek(d).add(-3).weeks(),
                            editorial_calendar_plus.nextStartOfWeek(d).add(editorial_calendar_plus.weeksPref + 3).weeks(), function() {

                 equals(jQuery('#post-' + editorial_calendar_plus.lastPostId).length, 1, 'The post should be added at ' + 
                        d.toString(Date.CultureInfo.formatPatterns.longDate));

                 editorial_calendar_plus.moveTo(Date.today());
                 start();
                 editorial_calendar_plus_test.testCreatePost();
             });


         });
    },

    testCreatePost: function() {
         /*
          * Now we'll do a few tests about creating, modifying, and deleting posts.
          */

         asyncTest('Create a new post', function() {
             expect(3);

             editorial_calendar_plus_test.post.title = 'Unit Test Post';
             editorial_calendar_plus_test.post.content = editorial_calendar_plus_test.testContent;
             editorial_calendar_plus_test.post.status = 'draft';
             editorial_calendar_plus_test.post.time = '10:00 AM';
             editorial_calendar_plus_test.post.date = Date.today().add(7).days().toString(editorial_calendar_plus.internalDateFormat);
             editorial_calendar_plus_test.post.id = '0';

             editorial_calendar_plus.savePost(editorial_calendar_plus_test.post, false, false, function(res) {
                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     start();
                     return;
                 }

                 equals(res.post.date, editorial_calendar_plus_test.post.date, 'The resulting post should have the same date as the request');
                 equals(res.post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;
                 
                 start();

                 editorial_calendar_plus_test.testGetPost();
             });
         });

    },

    testGetPost: function() {
         /*
          * We'll start by getting data about the post we've just created
          */

         asyncTest('Get post information', function() {
             expect(3);

             editorial_calendar_plus.getPost(editorial_calendar_plus_test.post.id, function(post) {
                 equals(post.date, editorial_calendar_plus_test.post.date, 'The resulting post should have the same date as the request');
                 equals(post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');
                 equals(post.content, editorial_calendar_plus_test.testContent, 'The resulting post content should be the same as the test post content');

                 editorial_calendar_plus_test.post = post;

                 start();

                 editorial_calendar_plus_test.testMovePost();
             });
         });

    },

    testMovePost: function() {

         asyncTest('Change the date of an existing post', function() {
             expect(2);

             // We added the post one week in the future, now we will move it
             // one day after that.
             var newDate = Date.today().add(8).days().toString(editorial_calendar_plus.internalDateFormat);

             editorial_calendar_plus.doDrop(editorial_calendar_plus_test.post.date, 'post-' + editorial_calendar_plus_test.post.id, newDate, function(res) {

                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     return;
                 }

                 equals(res.post.date, newDate, 'The resulting post should have the same date as the request');

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;

                 start();

                 editorial_calendar_plus_test.testMovePostOneWeek();
             });
         });

    },

    testMovePostOneWeek: function() {

         asyncTest('Make a second change to the date of an existing post', function() {
             expect(2);

             // We added the post one week in the future, now we will move it
             // one day after that.
             var newDate = Date.today().add(22).days().toString(editorial_calendar_plus.internalDateFormat);

             editorial_calendar_plus.doDrop(editorial_calendar_plus_test.post.date, 'post-' + editorial_calendar_plus_test.post.id, newDate, function(res) {

                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     return;
                 }

                 equals(res.post.date, newDate, 'The resulting post should have the same date as the request');

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;

                 start();

                 editorial_calendar_plus_test.testMovePostDraft();
             });
         });

    },

    testMovePostDraft: function() {

         asyncTest('Move an existing post to the drafts drawer', function() {
             expect(2);

             editorial_calendar_plus.doDrop(editorial_calendar_plus_test.post.date, 'post-' + editorial_calendar_plus_test.post.id, editorial_calendar_plus.NO_DATE, function(res) {

                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     return;
                 }

                 equals(res.post.date_gmt, editorial_calendar_plus.NO_DATE, 'The resulting post should have the same date as the request and it was ' + res.post.date);

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;

                 start();

                 editorial_calendar_plus_test.testEditPostDraft();
             });
         });

    },
    
    testEditPostDraft: function() {

         asyncTest('Edit the content of a draft post', function() {
             expect(2);
             
             editorial_calendar_plus_test.post.title = 'Unit Test Draft Post &#8211 Changed';
             editorial_calendar_plus_test.post.content = editorial_calendar_plus_test.testContent3;

             editorial_calendar_plus.savePost(editorial_calendar_plus_test.post, false, false, function(res)
                {
                    if (!res.post) {
                        ok(false, 'There was an error editing the post.');
                        start();
                        return;
                    }

                    equals(res.post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');
                    
                    equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                    editorial_calendar_plus_test.post = res.post;

                    start();

                    editorial_calendar_plus_test.testMovePostDraftSchedule();

                });
         });
    },
    
    testMovePostDraftSchedule: function() {

         asyncTest('Move a post from the drafts drawer back to the calendar', function() {
             expect(2);

             // We added the post one week in the future, now we will move it
             // two days after that.
             var newDate = Date.today().add(23).days().toString(editorial_calendar_plus.internalDateFormat);

             editorial_calendar_plus.doDrop(editorial_calendar_plus.NO_DATE, 'post-' + editorial_calendar_plus_test.post.id, newDate, function(res) {

                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     return;
                 }

                 equals(res.post.date, newDate, 'The resulting post should have the same date as the request and it was ' + res.post.date);

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;

                 start();

                 editorial_calendar_plus_test.testEditPost();
             });
         });

    },

    testEditPost: function() {

         asyncTest('Edit the content of an existing post and mark it as scheduled', function() {
             expect(2);

             editorial_calendar_plus_test.post.title = 'Unit Test Post &#8211 Changed';
             editorial_calendar_plus_test.post.content = editorial_calendar_plus_test.testContent2;

             editorial_calendar_plus.savePost(editorial_calendar_plus_test.post, false, true, function(res)
                {
                    if (!res.post) {
                        ok(false, 'There was an error editing the post.');
                        start();
                        return;
                    }

                    equals(res.post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');
                    
                    equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                    editorial_calendar_plus_test.post = res.post;

                    start();

                    editorial_calendar_plus_test.testGetAfterEdit();

                });
         });

    },
    
    testGetAfterEdit: function() {
         /*
          * Now we'll test to make sure our new post data still matches what we think it should
          */

         asyncTest('Get post information after editing', function() {
             expect(3);

             editorial_calendar_plus.getPost(editorial_calendar_plus_test.post.id, function(post) {
                 equals(post.date, editorial_calendar_plus_test.post.date, 'The resulting post should have the same date as the request');
                 equals(post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');
                 equals(post.content, editorial_calendar_plus_test.testContent2, 'The resulting post content should be the same as the test post content');

                 editorial_calendar_plus_test.post = post;

                 start();

                 editorial_calendar_plus_test.testDateConflict();
             });
         });

    },

    testDateConflict: function() {
         asyncTest('Try to change a post date and fail because of a concurrency conflict', function() {
             expect(2);

             editorial_calendar_plus_test.post.date = Date.today().add(-1).days().toString(editorial_calendar_plus.internalDateFormat);

             /*
              * We added the post one week in the future, now we will move it
              * one day after that.
              */
             var newDate = Date.today().add(8).days().toString(editorial_calendar_plus.internalDateFormat);

             editorial_calendar_plus.changeDate(newDate, editorial_calendar_plus_test.post, function(res)
                {
                    if (!res.post) {
                        ok(false, 'There was an error with the change date conflict.');
                        return;
                    }

                    equals(res.error, editorial_calendar_plus.CONCURRENCY_ERROR, 'This move should show an exception because it is in conflict.');

                    equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                    editorial_calendar_plus_test.post = res.post;

                    start();

                    editorial_calendar_plus_test.testDeletePost();

                });
         });

    },

    testDeletePost: function() {

         /*
          * The last step is to delete the post we made so
          * the test cleans up after itself.
          */
         asyncTest('Delete the post created for testing', function() {
             expect(1);

             editorial_calendar_plus.deletePost(editorial_calendar_plus_test.post.id, function(res)
                {
                    if (!res.post) {
                        ok(false, 'There was an error creating the new post.');
                        start();
                        return;
                    }

                    equals(jQuery('#post-' + res.post.id).length, 0, 'The post should now be deleted from the calendar.');
                    start();
                    
                    editorial_calendar_plus_test.testCreateDraftDrawerPost();

                });
         });
    },

    testCreateDraftDrawerPost: function() {
         /*
          * Now we'll create a new post in the drafts drawer
          */

         asyncTest('Create a new drafts drawer post', function() {
             expect(2);

             editorial_calendar_plus_test.post.title = 'Unit Test Drafts Drawer Post';
             editorial_calendar_plus_test.post.content = editorial_calendar_plus_test.testContent;
             editorial_calendar_plus_test.post.status = 'draft';
             editorial_calendar_plus_test.post.time = editorial_calendar_plus.NO_DATE;
             editorial_calendar_plus_test.post.date = editorial_calendar_plus.NO_DATE;
             editorial_calendar_plus_test.post.id = '0';

             editorial_calendar_plus.savePost(editorial_calendar_plus_test.post, false, false, function(res) {
                 if (!res.post) {
                     ok(false, 'There was an error creating the new post.');
                     start();
                     return;
                 }

                 equals(res.post.title, editorial_calendar_plus_test.post.title, 'The resulting post should have the same title as the request');

                 equals(jQuery('#post-' + res.post.id).length, 1, 'The post should be added in only one place in the calendar.');

                 editorial_calendar_plus_test.post = res.post;
                 
                 start();

                 editorial_calendar_plus_test.testDeleteDraftDrawerPost();
             });
         });

    },

    testDeleteDraftDrawerPost: function() {

         /*
          * The last step is to delete the post we made so
          * the test cleans up after itself.
          */
         asyncTest('Delete the post created for drafts drawer testing', function() {
             expect(1);

             editorial_calendar_plus.deletePost(editorial_calendar_plus_test.post.id, function(res)
                {
                    if (!res.post) {
                        ok(false, 'There was an error creating the new post.');
                        start();
                        return;
                    }

                    equals(jQuery('#post-' + res.post.id).length, 0, 'The post should now be deleted from the calendar.');
                    start();
                    
                    editorial_calendar_plus_test.finishTests();

                });
         });
    },
    
    finishTests: function() {
        if (!editorial_calendar_plus_test.isDraftsDrawerVisible) {
            /*
             * We need to make sure the drafts drawer is open because
             * we can use it in the tests so we open it when the tests
             * start if it isn't open already.  We want to close it at
             * the end if we opened it.
             */
            editorial_calendar_plus.setDraftsDrawerVisible(false);
        }
    }
};
