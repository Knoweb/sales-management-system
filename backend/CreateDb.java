import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CreateDb {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/sales_management", "postgres", "postgres");
            Statement stmt = conn.createStatement();
            stmt.execute("CREATE DATABASE sales_management_test");
            System.out.println("Database created successfully");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
