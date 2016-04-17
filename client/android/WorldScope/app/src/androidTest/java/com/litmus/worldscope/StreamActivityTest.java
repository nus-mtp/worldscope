package com.litmus.worldscope;

import android.support.test.espresso.PerformException;
import android.support.test.espresso.UiController;
import android.support.test.espresso.ViewAction;
import android.support.test.espresso.action.ViewActions;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;
import android.test.suitebuilder.annotation.LargeTest;
import android.view.View;
import android.widget.Adapter;
import android.widget.AdapterView;

import junit.framework.TestCase;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static android.support.test.espresso.Espresso.onView;
import static android.support.test.espresso.action.ViewActions.closeSoftKeyboard;
import static android.support.test.espresso.action.ViewActions.doubleClick;
import static android.support.test.espresso.action.ViewActions.longClick;
import static android.support.test.espresso.assertion.ViewAssertions.matches;
import static android.support.test.espresso.action.ViewActions.click;
import static android.support.test.espresso.action.ViewActions.typeText;
import static android.support.test.espresso.matcher.ViewMatchers.withId;
import static android.support.test.espresso.matcher.ViewMatchers.withResourceName;
import static android.support.test.espresso.matcher.ViewMatchers.withText;
import static android.support.test.espresso.matcher.ViewMatchers.isDisplayed;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasEntry;
import android.support.test.espresso.matcher.BoundedMatcher;
import java.util.Map;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class StreamActivityTest extends TestCase{

    @Rule
    public ActivityTestRule<LoginActivity> mActivityRule = new ActivityTestRule(LoginActivity.class);

    private final static String ROOM_TITLE = "Automated Test Room Title";

    private final static String ROOM_DESCRIPTION = "Automated Test Room Description";

    private final static String SAMPLE_COMMENT = "Automated Test Sample Comment";

    @Before
    public void setupTest() {
        onView(withResourceName("content"))
                .perform(waitFor(10000));
        onView(withId(R.id.facebook_login_button))
                .perform(click());
    }

    @Test
    public void testRedirectStreamActivity() {
        onView(withId(R.id.fab))
                .perform(click());

        onView(withId(R.id.streamActivity))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testTitleFragmentNotShown() {
        onView(withId(R.id.fab))
                .perform(click());

        onView(withId(R.id.titleFragment))
                .check(matches(not(isDisplayed())));
    }

    @Test
    public void testCommentFragmentNotShown() {
        onView(withId(R.id.fab))
                .perform(click());

        onView(withId(R.id.commentFragment))
                .check(matches(not(isDisplayed())));
    }

    @Test
    public void testStreamVideoControlFragmentNotShown() {
        onView(withId(R.id.fab))
                .perform(click());

        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(not(isDisplayed())));
    }

    @Test
    public void testCanTypeTitle() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.titleInput))
                .check(matches(withText(ROOM_TITLE)));
    }

    @Test
    public void testCanTypeDescription() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.descriptionInput))
                .check(matches(withText(ROOM_DESCRIPTION)));
    }

    @Test
    public void testCreateStreamCancel() {
        onView(withId(R.id.fab))
                .perform(click());

        onView(withId(R.id.cancelStreamButton))
                .perform(click());

        onView(withId(R.id.drawer_layout))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testCreateStreamWillFailWithoutTitle() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.titleFragment))
                .check(matches(not(isDisplayed())));
    }

    @Test
    public void testCreateStreamWillPassWithoutDescription() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.titleFragment))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testCreateStreamAndTitleFragmentIsShown() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.titleFragment))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testCreateStreamAndCommentFragmentIsShown() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.commentFragment))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testCreateStreamAndStreamVideoControlFragmentIsShown() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testShowStreamingControl() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.streamActivity))
                .perform(doubleClick());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testStreamCanTypeComment() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.commentEditText))
                .perform(typeText(SAMPLE_COMMENT));
        onView(withId(R.id.commentEditText))
                .check(matches(withText(SAMPLE_COMMENT)));
    }

    @Test
    public void testStreamCanSendComment() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.commentEditText))
                .perform(typeText(SAMPLE_COMMENT));
        onView(withId(R.id.commentEditText))
                .check(matches(withText(SAMPLE_COMMENT)));
        onView(withId(R.id.commentEditText))
                .perform(closeSoftKeyboard());
        onView(withId(R.id.send_button))
                .perform(click());

        onView(withId(R.id.streamActivity))
                .perform(waitFor(2000));

        onView(withId(R.id.commentListView))
                .check(matches(withAdaptedData(withItemContent("content: " + SAMPLE_COMMENT))));
    }

    @Test
    public void testShowEndStreamConfirmation() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.streamActivity))
                .perform(doubleClick());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(isDisplayed()));
        onView(withId(R.id.fabRecordButton))
                .perform(longClick());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.stopStreamConfirmationText))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testEndStream() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.streamActivity))
                .perform(doubleClick());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(isDisplayed()));
        onView(withId(R.id.fabRecordButton))
                .perform(longClick());
        onView(withId(R.id.stopStreamConfirmationText))
                .check(matches(isDisplayed()));
        onView(withId(R.id.confirmStopStreamButton))
                .perform(click());
        onView(withId(R.id.drawer_layout))
                .check(matches(isDisplayed()));
    }


    @Test
    public void testEndStreamCancel() {
        onView(withId(R.id.fab))
                .perform(click());
        onView(withId(R.id.titleInput))
                .perform(typeText(ROOM_TITLE));
        onView(withId(R.id.descriptionInput))
                .perform(typeText(ROOM_DESCRIPTION));
        onView(withId(R.id.createStreamButton))
                .perform(ViewActions.closeSoftKeyboard());
        onView(withId(R.id.createStreamButton))
                .perform(click());
        onView(withId(R.id.streamActivity))
                .perform(doubleClick());
        onView(withId(R.id.streamActivity))
                .perform(waitFor(500));
        onView(withId(R.id.streamVideoControlFragment))
                .check(matches(isDisplayed()));
        onView(withId(R.id.fabRecordButton))
                .perform(longClick());
        onView(withId(R.id.stopStreamConfirmationText))
                .check(matches(isDisplayed()));
        onView(withId(R.id.cancelStopStreamButton))
                .perform(click());
        onView(withId(R.id.stopStreamConfirmationText))
                .check(matches(not(isDisplayed())));
    }

    public static ViewAction waitFor(final long millis) {
        return new ViewAction() {
            @Override
            public Matcher<View> getConstraints() {
                return isDisplayed();
            }

            @Override
            public String getDescription() {
                return "wait for a specific time: " + millis + " millis.";
            }

            @Override
            public void perform(final UiController uiController, final View view) {
                uiController.loopMainThreadUntilIdle();
                final long startTime = System.currentTimeMillis();
                final long endTime = startTime + millis;

                while (System.currentTimeMillis() < endTime);
            }
        };
    }

    private static Matcher<View> withAdaptedData(final Matcher<Object> dataMatcher) {
        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("with class name: ");
                dataMatcher.describeTo(description);
            }
            @Override
            public boolean matchesSafely(View view) {
                if (!(view instanceof AdapterView)) {
                    return false;
                }
                @SuppressWarnings("rawtypes")
                Adapter adapter = ((AdapterView) view).getAdapter();
                for (int i = 0; i < adapter.getCount(); i++) {
                    if (dataMatcher.matches(adapter.getItem(i))) {
                        return true;
                    }
                }
                return false;
            }
        };
    }

    /**
     * Creates a matcher against the text stored in R.id.item_content. This text is roughly
     * "item: $row_number".
     */
    public static Matcher<Object> withItemContent(String expectedText) {
        // use preconditions to fail fast when a test is creating an invalid matcher.
        if(expectedText == null) {
            return null;
        }
        return withItemContent(equalTo(expectedText));
    }

    /**
     * Creates a matcher against the text stored in R.id.item_content. This text is roughly
     * "item: $row_number".
     */
    @SuppressWarnings("rawtypes")
    public static Matcher<Object> withItemContent(final Matcher<String> itemTextMatcher) {
        // use preconditions to fail fast when a test is creating an invalid matcher.
        if(itemTextMatcher == null) {
            return null;
        }
        return new BoundedMatcher<Object, Map>(Map.class) {
            @Override
            public boolean matchesSafely(Map map) {
                return hasEntry(equalTo("STR"), itemTextMatcher).matches(map);
            }
            @Override
            public void describeTo(Description description) {
                description.appendText("with item content: ");
                itemTextMatcher.describeTo(description);
            }
        };
    }
}