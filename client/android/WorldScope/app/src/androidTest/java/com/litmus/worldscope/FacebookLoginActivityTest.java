package com.litmus.worldscope;

import android.app.Instrumentation;
import android.support.test.InstrumentationRegistry;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;

import com.litmus.worldscope.model.WorldScopeUser;

import junit.framework.TestCase;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class FacebookLoginActivityTest extends TestCase{

    private FacebookLoginActivity facebookLoginActivity;


    @Rule
    public ActivityTestRule<FacebookLoginActivity> activityRule = new ActivityTestRule<>(
            FacebookLoginActivity.class);

    @Before
    public void setUp() {
        facebookLoginActivity = activityRule.getActivity();
    }

    @Test
    public void testTrue() {
        assertEquals(true, true);
    }

    @Test
    public void testRedirectToMainActivity() {
        String testUserName = "testUserName";
        WorldScopeUser mockUser = new WorldScopeUser();
        Instrumentation.ActivityMonitor am = InstrumentationRegistry.getInstrumentation().addMonitor(MainActivity.class.getName(), null, true);
        facebookLoginActivity.redirectToMainActivity(mockUser);
        assertEquals(1, am.getHits());
    }
}