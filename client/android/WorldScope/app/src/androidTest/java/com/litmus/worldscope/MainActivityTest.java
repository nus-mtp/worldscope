package com.litmus.worldscope;

import android.app.Instrumentation;
import android.support.test.InstrumentationRegistry;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;

import junit.framework.TestCase;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class MainActivityTest extends TestCase{

    private static final Boolean IS_LOGOUT_ATTEMPT = true;
    private MainActivity mainActivity;


    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(
            MainActivity.class);

    @Before
    public void setUp() {
        mainActivity = activityRule.getActivity();
    }

    @Test
    public void testTrue() {
        assertEquals(true, true);
    }

    @Test
    public void testRedirectToStreamActivity() {
        Instrumentation.ActivityMonitor am = InstrumentationRegistry.getInstrumentation()
                .addMonitor(StreamActivity.class.getName(), null, true);
        mainActivity.redirectToStreamActivity();
        assertEquals(1, am.getHits());
    }

    @Test
    public void testRedirectToViewActivity() {
        Instrumentation.ActivityMonitor am = InstrumentationRegistry.getInstrumentation()
                .addMonitor(ViewActivity.class.getName(), null, true);
        mainActivity.redirectToViewActivity();
        assertEquals(1, am.getHits());
    }

    @Test
    public void testRedirectToFacebookLoginActivity() {
        Instrumentation.ActivityMonitor am = InstrumentationRegistry.getInstrumentation()
                .addMonitor(LoginActivity.class.getName(), null, true);
        mainActivity.redirectToLoginActivity(IS_LOGOUT_ATTEMPT);
        assertEquals(1, am.getHits());
    }
}