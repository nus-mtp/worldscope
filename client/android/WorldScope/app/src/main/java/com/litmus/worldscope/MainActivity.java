package com.litmus.worldscope;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.Log;
import android.view.View;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.AccessToken;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.HttpMethod;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Transformation;

import org.json.JSONException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {

    private final String TAG = "MainActivity";

    private final String WELCOME_MSG = "Welcome to WorldScope, %s";

    /**
     * The {@link android.support.v4.view.PagerAdapter} that will provide
     * fragments for each of the sections. We use a
     * {@link FragmentPagerAdapter} derivative, which will keep every
     * loaded fragment in memory. If this becomes too memory intensive, it
     * may be best to switch to a
     * {@link android.support.v4.app.FragmentStatePagerAdapter}.
     */
    private SectionsPagerAdapter mSectionsPagerAdapter;

    /**
     * The {@link ViewPager} that will host the section contents.
     */
    private ViewPager mViewPager;

    private WorldScopeUser loginUser;

    private Context context;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);

        context = this;

        // Get user information
        loginUser = getIntent().getParcelableExtra("loginUser");
        Log.d(TAG, "" + loginUser.toString());

        Toast toast = Toast.makeText(context, String.format(WELCOME_MSG, loginUser.getAlias()), Toast.LENGTH_LONG);
        toast.show();

        // Set title of toolbar to WorldScope
        setSupportActionBar(toolbar);
        try {
            getSupportActionBar().setTitle(R.string.app_name);
        } catch(NullPointerException e){
            e.printStackTrace();
        }

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                redirectToStreamActivity();
            }
        });

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.setDrawerListener(toggle);
        toggle.syncState();


        //Set up the tabs

        mSectionsPagerAdapter = new SectionsPagerAdapter(getSupportFragmentManager());

        // Set up the ViewPager with the sections adapter.
        mViewPager = (ViewPager) findViewById(R.id.container);
        mViewPager.setAdapter(mSectionsPagerAdapter);

        TabLayout tabLayout = (TabLayout) findViewById(R.id.tabs);
        tabLayout.setupWithViewPager(mViewPager);

        NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Load user information into Drawer after it is loaded
        loadUserInfoIntoDrawer();
        return true;
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        if (id == R.id.nav_profile) {
            // Handle the camera action
        } else if (id == R.id.nav_followers) {

        } else if (id == R.id.nav_setting) {

        } else if (id == R.id.nav_streams) {

        } else if (id == R.id.nav_help) {

        } else if (id == R.id.nav_logout) {
            Log.d(TAG, "Logging out");
            logoutFromAppServer();
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    /**
     * A {@link FragmentPagerAdapter} that returns a fragment corresponding to
     * one of the sections/tabs/pages.
     */
    public class SectionsPagerAdapter extends FragmentPagerAdapter {

        public SectionsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {
            // getItem is called to instantiate the fragment for the given page.
            // Return a PlaceholderFragment (defined as a static inner class below).
            return StreamRefreshListFragment.newInstance(position + 1);
        }

        @Override
        public int getCount() {
            // Show 3 total pages.
            return 3;
        }

        @Override
        public CharSequence getPageTitle(int position) {
            switch (position) {
                case 0:
                    return "Popular";
                case 1:
                    return "Latest";
                case 2:
                    return "Followers";
            }
            return null;
        }
    }

    // Redirects to view activity

    private void redirectToViewActivity() {
        Intent intent = new Intent(this, ViewActivity.class);
        startActivity(intent);
    }


    // Redirects to stream activity

    private void redirectToStreamActivity() {
        Intent intent = new Intent(this, StreamActivity.class);
        startActivity(intent);
    }


    // Query Facebook graph API for profile picture and loads Alias and picture into Drawer

    private void loadUserInfoIntoDrawer() {
        TextView alias = (TextView) findViewById(R.id.drawerAlias);
        final ImageView facebookProfilePicture = (ImageView) findViewById(R.id.drawerFacebookProfilePicture);

        // Set alias into drawer
        alias.setText(loginUser.getAlias());

        Bundle facebookGraphParams = new Bundle();
        facebookGraphParams.putInt("height", 400);
        facebookGraphParams.putInt("width", 400);
        facebookGraphParams.putBoolean("redirect", false);
        /* make the API call */
        new GraphRequest(
                AccessToken.getCurrentAccessToken(),
                "/"+ loginUser.getPlatformId() +"/picture",
                facebookGraphParams,
                HttpMethod.GET,
                new GraphRequest.Callback() {
                    public void onCompleted(GraphResponse response) {
                        /* handle the result */
                        try {
                            String facebookProfilePictureUrl = response.getJSONObject().getJSONObject("data").get("url").toString();
                            Log.d(TAG, "" + facebookProfilePictureUrl);
                            Picasso.with(facebookProfilePicture.getContext())
                                    .load(facebookProfilePictureUrl)
                                    .transform(new CircleTransform())
                                    .into(facebookProfilePicture);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                    }
                }
        ).executeAsync();

    }

    private void logoutFromAppServer() {
        Call<WorldScopeUser> call = WorldScopeRestAPI.buildWorldScopeAPIService().logoutUser();
        call.enqueue(new Callback<WorldScopeUser>() {
            @Override
            public void onResponse(Response<WorldScopeUser> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Success!");
                    Log.d(TAG, "" + response.body().toString());

                    // Redirect to FacebookLoginActivty
                    Intent intent = new Intent(context, FacebookLoginActivity.class);
                    startActivity(intent);
                } else {
                    Log.d(TAG, "Failure!");
                    Log.d(TAG, "" + response.code());
                    Log.d(TAG, "" + response.body().toString());
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
            }
        });
    }

    public class CircleTransform implements Transformation {
        @Override
        public Bitmap transform(Bitmap source) {
            int size = Math.min(source.getWidth(), source.getHeight());

            int x = (source.getWidth() - size) / 2;
            int y = (source.getHeight() - size) / 2;

            Bitmap squaredBitmap = Bitmap.createBitmap(source, x, y, size, size);
            if (squaredBitmap != source) {
                source.recycle();
            }

            Bitmap bitmap = Bitmap.createBitmap(size, size, source.getConfig());

            Canvas canvas = new Canvas(bitmap);
            Paint paint = new Paint();
            BitmapShader shader = new BitmapShader(squaredBitmap, BitmapShader.TileMode.CLAMP, BitmapShader.TileMode.CLAMP);
            paint.setShader(shader);
            paint.setAntiAlias(true);

            float r = size / 2f;
            canvas.drawCircle(r, r, r, paint);

            squaredBitmap.recycle();
            return bitmap;
        }

        @Override
        public String key() {
            return "circle";
        }
    }
}
