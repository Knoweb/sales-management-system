import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckHistory {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/sales_management";
        String user = "postgres";
        String password = "postgres";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT version, script, success FROM flyway_schema_history ORDER BY installed_rank")) {
            
            while (rs.next()) {
                System.out.println("FLYWAY_HISTORY: " + rs.getString("version") + " | " + rs.getString("script") + " | " + rs.getBoolean("success"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
