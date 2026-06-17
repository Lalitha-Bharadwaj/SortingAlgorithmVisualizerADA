with Ada.Strings.Fixed;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Text_IO;

package body Sort_Types is

   function Action_Img (Act : Action_Kind) return String is
   begin
      case Act is
         when Compare => return "compare";
         when Swap    => return "swap";
         when Set     => return "set";
         when Pivot   => return "pivot";
         when Merge   => return "merge";
         when Sorted  => return "sorted";
      end case;
   end Action_Img;

   function Trim (S : String) return String is
   begin
      return Ada.Strings.Fixed.Trim (S, Ada.Strings.Both);
   end Trim;

   procedure Append_Val (Result : in out Unbounded_String; Val : Integer; First : in out Boolean) is
      Val_Str : constant String := Trim (Integer'Image (Val));
   begin
      if not First then
         Append (Result, ",");
      end if;
      Append (Result, Val_Str);
      First := False;
   end Append_Val;

   function To_Json (Step : Trace_Step) return Unbounded_String is
      Result : Unbounded_String;
      First : Boolean;
   begin
      Result := To_Unbounded_String ("{""step"":");
      Append (Result, Trim (Integer'Image (Step.Step_Num)));
      Append (Result, ",""action"":""" & Action_Img (Step.Action) & """,");

      -- Serialize indices
      Append (Result, """indices"":[");
      First := True;
      for Idx of Step.Indices loop
         Append_Val (Result, Idx, First);
      end loop;
      Append (Result, "],");

      -- Serialize array state
      Append (Result, """array"":[");
      First := True;
      for Val of Step.Arr loop
         Append_Val (Result, Val, First);
      end loop;
      Append (Result, "]}");

      return Result;
   end To_Json;

   procedure Append_Step_Json (Output : in out Unbounded_String; Step : Trace_Step; First : in out Boolean) is
      Step_Json : constant Unbounded_String := To_Json (Step);
   begin
      if not First then
         Append (Output, ",");
      end if;
      Append (Output, Step_Json);
      First := False;
   end Append_Step_Json;

   function To_Json (Result : Sort_Result; Algo_Name : String) return Unbounded_String is
      Output : Unbounded_String;
      First : Boolean;
      Float_Str : constant String := Trim (Float'Image (Result.Time_Ms));
   begin
      Output := To_Unbounded_String ("{");
      Append (Output, """algorithm"":""" & Algo_Name & """,");
      Append (Output, """comparisonsCount"":" & Trim (Integer'Image (Result.Comparisons)) & ",");
      Append (Output, """swapsCount"":" & Trim (Integer'Image (Result.Swaps)) & ",");
      Append (Output, """operationCount"":" & Trim (Integer'Image (Result.Operations)) & ",");
      Append (Output, """executionTime"":" & Float_Str & ",");
      Append (Output, """trace"":[");

      First := True;
      for Step of Result.Trace loop
         Append_Step_Json (Output, Step, First);
      end loop;
      Append (Output, "]}");

      return Output;
   end To_Json;

end Sort_Types;
